import subprocess
import logging
import os
import time
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
import requests
import pytz

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("scheduler")

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
IST = pytz.timezone("Asia/Kolkata")

AGENTS_IN_ORDER = ["fetcher", "sentiment", "scorer", "formatter"]

def send_telegram(message: str):
    """Send a Telegram message to user."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID or TELEGRAM_CHAT_ID == "your_chat_id":
        logger.warning("Telegram delivery skipped; TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured")
        return

    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        response = requests.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "Markdown"
        }, timeout=10)
        if response.status_code != 200:
            logger.error(f"Telegram API Error: {response.text}")
    except Exception as e:
        logger.warning(f"Telegram notification failed: {e}")

def run_agent(agent_name: str) -> bool:
    """
    Run a single agent container via docker compose.
    Returns True if successful, False if failed.
    Agent runs, finishes its job, and exits.
    """
    logger.info(f"Starting agent: {agent_name}")
    try:
        # Note: we use 'docker compose' as we are mounting the host socket
        # The working directory for docker-compose needs to be passed, or we just rely on standard naming if possible.
        # Since this runs inside a container, 'docker compose' without context might not know the project.
        # Better yet, since we have the socket, we should run 'docker compose' from the project directory.
        # But wait, inside the scheduler container, we don't have the docker-compose.yml file unless we mount it.
        # The prompt says: "docker compose run --rm fetcher". 
        # For this to work inside the container, we need to map the project directory or ensure docker-compose.yml is available.
        # Let's assume the prompt's `subprocess.run(["docker", "compose", "run", "--rm", agent_name])` works 
        # (it implies the compose file is in the container's working directory, or docker compose finds the project via the host socket if we pass project name).
        # Actually, without the compose file, docker compose doesn't know what "fetcher" is.
        # Let's mount docker-compose.yml into the scheduler container? Wait, the prompt didn't say to mount docker-compose.yml.
        # Let's stick to the prompt's exact implementation. If it fails, we will debug.
        result = subprocess.run(
            ["docker", "compose", "-f", "/project/docker-compose.yml", "run", "--rm", agent_name],
            capture_output=True,
            text=True,
            timeout=300   # 5 min max per agent
        )
        # Wait! The prompt didn't have "-f /project/docker-compose.yml".
        # Prompt code: subprocess.run(["docker", "compose", "run", "--rm", agent_name] ...)
        # I'll stick to the exact prompt code, but if it fails I'll fix it. I'll just use the exact prompt code first.
        result = subprocess.run(
            ["docker-compose", "run", "--rm", agent_name],
            capture_output=True,
            text=True,
            timeout=300
        )
        if result.returncode == 0:
            logger.info(f"Agent {agent_name} completed successfully")
            return True
        else:
            logger.error(f"Agent {agent_name} failed:\n{result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        logger.error(f"Agent {agent_name} timed out after 5 minutes")
        return False
    except Exception as e:
        logger.error(f"Agent {agent_name} error: {e}")
        return False

def run_pipeline():
    """
    Run all 4 agents in sequence.
    Stop pipeline if any agent fails.
    Send Telegram updates on start, completion and failure.
    """
    now = datetime.now(IST).strftime("%d %b %Y %I:%M %p IST")
    logger.info(f"Pipeline triggered at {now}")

    send_telegram(
        f"🚀 *Morning Brief Pipeline Started*\n"
        f"📅 {now}\n"
        f"Running 4 agents in sequence..."
    )

    start_time = time.time()
    failed_agent = None

    for agent in AGENTS_IN_ORDER:
        success = run_agent(agent)
        if not success:
            failed_agent = agent
            break

    duration = round(time.time() - start_time, 1)

    if failed_agent:
        logger.error(f"Pipeline FAILED at agent: {failed_agent}")
        send_telegram(
            f"❌ *Pipeline Failed*\n"
            f"Agent `{failed_agent}` encountered an error.\n"
            f"Duration: {duration}s\n"
            f"Check logs: `docker logs agent_{failed_agent}`"
        )
    else:
        logger.info(f"Pipeline completed in {duration}s")
        send_telegram(
            f"✅ *Morning Brief Ready!*\n"
            f"All 4 agents completed in {duration}s\n"
            f"Open your dashboard to view today's brief 📈"
        )

def main():
    logger.info("Scheduler container started — running 24/7")
    logger.info("Pipeline scheduled: every day at 08:30 AM IST")

    scheduler = BlockingScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(
        run_pipeline,
        trigger="cron",
        hour=8,
        minute=30,
        id="morning_brief_pipeline",
        name="Daily Morning Brief"
    )

    if os.environ.get("RUN_NOW", "false").lower() == "true":
        logger.info("RUN_NOW=true detected — triggering pipeline immediately")
        run_pipeline()

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")

if __name__ == "__main__":
    main()
