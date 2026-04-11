"""
bank_directory.py
=================
Central registry of Indian banks with:
  - Helpline numbers, website, mobile app names
  - Supported services and step-by-step instructions
  - Automatable services (EMI / FD calculators)
  - Helper detection functions
"""

from typing import Optional

# ─── Bank Directory ──────────────────────────────────────────────────────────

BANK_DIRECTORY: dict = {
    "SBI": {
        "full_name": "State Bank of India",
        "helpline": ["1800 11 2211", "1800 425 3800", "080-26599990"],
        "website": "https://www.onlinesbi.sbi",
        "mobile_app": ["YONO SBI", "SBI Anywhere"],
        "services": {
            "balance_check": {
                "description": "Check your account balance",
                "instructions": [
                    "Use YONO SBI app → Accounts → Balance Enquiry",
                    "Missed call to 09223766666 from registered mobile number",
                    "SMS 'BAL' to 09223766666",
                    "Visit nearest ATM with your debit card",
                    "Call helpline 1800 11 2211 (toll-free)",
                ],
            },
            "lost_card": {
                "description": "Report lost or stolen debit/credit card",
                "instructions": [
                    "Immediately call 1800 11 2211 (24x7 helpline)",
                    "Use YONO SBI app → Services → Block Debit Card",
                    "Visit nearest SBI branch with ID proof",
                    "Use SBI ATM → Other Services → Block Card",
                ],
            },
            "mini_statement": {
                "description": "Get last 5 transactions",
                "instructions": [
                    "Missed call to 09223866666 from registered mobile",
                    "SMS 'MSTMT' to 09223766666",
                    "Use YONO SBI app → Accounts → Mini Statement",
                    "Use any SBI ATM",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds to another account",
                "instructions": [
                    "Step 1: Open YONO SBI app and log in",
                    "Step 2: Go to 'Fund Transfer'",
                    "Step 3: Select NEFT / RTGS / IMPS as per requirement",
                    "Step 4: Add beneficiary (Name, Account No, IFSC)",
                    "Step 5: Enter amount and remarks",
                    "Step 6: Verify with OTP sent to registered mobile",
                    "Step 7: Confirm transaction — you'll receive SMS confirmation",
                ],
            },
        },
    },

    "HDFC": {
        "full_name": "HDFC Bank",
        "helpline": ["1800 202 6161", "1800 267 6161", "022-61606161"],
        "website": "https://www.hdfcbank.com",
        "mobile_app": ["HDFC Bank Mobile Banking", "PayZapp"],
        "services": {
            "balance_check": {
                "description": "Check your account balance",
                "instructions": [
                    "Use HDFC Bank app → Accounts → Account Summary",
                    "Missed call to 18002676161 from registered mobile",
                    "SMS 'BAL <last 4 digits of account>' to 5676712",
                    "Call helpline 1800 202 6161",
                ],
            },
            "lost_card": {
                "description": "Block lost or stolen card",
                "instructions": [
                    "Call 1800 202 6161 immediately (24x7)",
                    "Use HDFC Bank app → Cards → Block/Hotlist Card",
                    "Visit nearest HDFC Bank branch",
                    "Use HDFC ATM → Other Services → Block Card",
                ],
            },
            "mini_statement": {
                "description": "Get recent transactions",
                "instructions": [
                    "Use HDFC Bank app → Accounts → Statement",
                    "SMS 'LTXN <last 4 digits>' to 5676712",
                    "Use HDFC ATM → Mini Statement",
                    "Net Banking → Accounts → Account Statement",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds",
                "instructions": [
                    "Step 1: Log in to HDFC Bank app or Net Banking",
                    "Step 2: Go to 'Fund Transfer'",
                    "Step 3: Choose NEFT / RTGS / IMPS",
                    "Step 4: Add / select beneficiary (registered mobile required)",
                    "Step 5: Enter amount and purpose",
                    "Step 6: Authenticate with OTP / IPIN",
                    "Step 7: Transaction confirmed — note the reference number",
                ],
            },
        },
    },

    "ICICI": {
        "full_name": "ICICI Bank",
        "helpline": ["1800 1080", "1800 200 3344", "022-33667777"],
        "website": "https://www.icicibank.com",
        "mobile_app": ["iMobile Pay", "Pockets by ICICI Bank"],
        "services": {
            "balance_check": {
                "description": "Check account balance",
                "instructions": [
                    "iMobile Pay app → Accounts → Balance",
                    "Missed call to 9594612612 from registered mobile",
                    "SMS 'IBAL' to 9215676766",
                    "Call 1800 1080",
                ],
            },
            "lost_card": {
                "description": "Block lost card",
                "instructions": [
                    "Call 1800 1080 immediately",
                    "iMobile Pay → Cards → Block Card",
                    "Net Banking → My Accounts → Cards → Block",
                ],
            },
            "mini_statement": {
                "description": "Recent transactions",
                "instructions": [
                    "SMS 'ITXN' to 9215676766",
                    "iMobile Pay → Accounts → Transactions",
                    "ICICI ATM → Mini Statement",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds",
                "instructions": [
                    "Step 1: Open iMobile Pay and login",
                    "Step 2: Select 'Fund Transfer'",
                    "Step 3: Choose transfer type (NEFT/RTGS/IMPS/UPI)",
                    "Step 4: Add beneficiary details",
                    "Step 5: Enter amount",
                    "Step 6: Confirm with OTP",
                    "Step 7: Save the transaction reference number",
                ],
            },
        },
    },

    "Axis": {
        "full_name": "Axis Bank",
        "helpline": ["1800 419 5959", "1800 209 5577", "022-27648000"],
        "website": "https://www.axisbank.com",
        "mobile_app": ["Axis Mobile", "Axis Pay UPI App"],
        "services": {
            "balance_check": {
                "description": "Check balance",
                "instructions": [
                    "Axis Mobile app → Accounts → Balance",
                    "Missed call to 18004195959",
                    "SMS 'BAL' to 56161600",
                ],
            },
            "lost_card": {
                "description": "Block lost card",
                "instructions": [
                    "Call 1800 419 5959 immediately",
                    "Axis Mobile app → Cards → Block Card",
                ],
            },
            "mini_statement": {
                "description": "Recent transactions",
                "instructions": [
                    "SMS 'MINI' to 56161600",
                    "Axis Mobile app → Accounts → Transactions",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds",
                "instructions": [
                    "Step 1: Open Axis Mobile app",
                    "Step 2: Go to Payments → Fund Transfer",
                    "Step 3: Select NEFT / IMPS / RTGS",
                    "Step 4: Enter beneficiary details",
                    "Step 5: Enter amount and confirm with MPIN/OTP",
                ],
            },
        },
    },

    "Kotak": {
        "full_name": "Kotak Mahindra Bank",
        "helpline": ["1860 266 2666", "022-62752222"],
        "website": "https://www.kotak.com",
        "mobile_app": ["Kotak811", "Kotak Mobile Banking App"],
        "services": {
            "balance_check": {
                "description": "Check balance",
                "instructions": [
                    "Kotak Mobile App → Dashboard",
                    "Missed call to 18602662666",
                    "SMS 'BAL' to 9971056767",
                ],
            },
            "lost_card": {
                "description": "Block lost card",
                "instructions": [
                    "Call 1860 266 2666 immediately",
                    "Kotak app → Cards → Block Card",
                ],
            },
            "mini_statement": {
                "description": "Recent transactions",
                "instructions": [
                    "Kotak app → Accounts → Statements",
                    "SMS 'MINI' to 9971056767",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds",
                "instructions": [
                    "Step 1: Open Kotak Mobile App",
                    "Step 2: Select 'Transfers'",
                    "Step 3: Choose beneficiary or add new",
                    "Step 4: Enter amount and confirm with OTP",
                ],
            },
        },
    },

    "PNB": {
        "full_name": "Punjab National Bank",
        "helpline": ["1800 180 2222", "1800 103 2222", "011-28044907"],
        "website": "https://www.pnbindia.in",
        "mobile_app": ["PNB ONE", "PNB mPassbook"],
        "services": {
            "balance_check": {
                "description": "Check balance",
                "instructions": [
                    "PNB ONE app → Balance Enquiry",
                    "Missed call to 18001802223",
                    "SMS 'BAL' to 5607040",
                ],
            },
            "lost_card": {
                "description": "Block lost card",
                "instructions": [
                    "Call 1800 180 2222 immediately",
                    "PNB ONE app → Card Services → Block Card",
                ],
            },
            "mini_statement": {
                "description": "Recent transactions",
                "instructions": [
                    "Missed call to 18001202223",
                    "PNB ONE app → Accounts → Statement",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds",
                "instructions": [
                    "Step 1: Login to PNB ONE app",
                    "Step 2: Go to Fund Transfer",
                    "Step 3: Select NEFT / RTGS / IMPS",
                    "Step 4: Enter beneficiary and amount",
                    "Step 5: Confirm with OTP",
                ],
            },
        },
    },

    "BOB": {
        "full_name": "Bank of Baroda",
        "helpline": ["1800 5700", "1800 258 4455", "079-26791816"],
        "website": "https://www.bankofbaroda.in",
        "mobile_app": ["bob World", "Baroda MPay"],
        "services": {
            "balance_check": {
                "description": "Check balance",
                "instructions": [
                    "bob World app → Accounts → Balance",
                    "Missed call to 8468001111",
                    "SMS 'BAL' to 8422009988",
                ],
            },
            "lost_card": {
                "description": "Block lost card",
                "instructions": [
                    "Call 1800 5700 immediately",
                    "bob World app → Cards → Block Card",
                ],
            },
            "mini_statement": {
                "description": "Recent transactions",
                "instructions": [
                    "Missed call to 8468001122",
                    "bob World app → Accounts → Transactions",
                ],
            },
            "fund_transfer": {
                "description": "Transfer funds",
                "instructions": [
                    "Step 1: Open bob World app",
                    "Step 2: Select 'Fund Transfer'",
                    "Step 3: Add beneficiary and choose transfer type",
                    "Step 4: Enter amount and confirm with MPIN/OTP",
                ],
            },
        },
    },
}

# ─── Bank Aliases ────────────────────────────────────────────────────────────

BANK_ALIASES: dict = {
    # SBI
    "sbi": "SBI", "state bank": "SBI", "state bank of india": "SBI",
    "bharatiya state bank": "SBI",
    # HDFC
    "hdfc": "HDFC", "hdfc bank": "HDFC", "housing development": "HDFC",
    # ICICI
    "icici": "ICICI", "icici bank": "ICICI",
    # Axis
    "axis": "Axis", "axis bank": "Axis", "utm bank": "Axis",
    # Kotak
    "kotak": "Kotak", "kotak bank": "Kotak", "kotak mahindra": "Kotak",
    # PNB
    "pnb": "PNB", "punjab national": "PNB", "punjab national bank": "PNB",
    # BOB
    "bob": "BOB", "bank of baroda": "BOB", "baroda bank": "BOB",
    "baroda": "BOB",
}

# ─── Service Keywords ────────────────────────────────────────────────────────

SERVICE_KEYWORDS: dict = {
    "balance_check": [
        "balance", "account balance", "check balance", "how much money",
        "remaining balance", "available balance", "bakiye", "शेष राशि",
    ],
    "lost_card": [
        "lost card", "stolen card", "block card", "card lost", "card stolen",
        "debit card lost", "credit card lost", "card block", "card missing",
    ],
    "mini_statement": [
        "mini statement", "last transactions", "recent transactions",
        "transaction history", "last 5", "past transactions",
    ],
    "fund_transfer": [
        "transfer", "send money", "fund transfer", "neft", "rtgs", "imps",
        "transfer money", "send funds", "pay someone",
    ],
}

# ─── Automatable Services ────────────────────────────────────────────────────

AUTOMATABLE_SERVICES: dict = {
    "emi_calculator": [
        "emi", "loan emi", "monthly installment", "calculate emi",
        "home loan emi", "car loan emi", "emi calculator",
    ],
    "fd_calculator": [
        "fd", "fixed deposit", "fd calculator", "fd maturity",
        "fd interest", "fixed deposit calculator",
    ],
}

# ─── Escalation Keywords ─────────────────────────────────────────────────────

ESCALATION_KEYWORDS = [
    "fraud", "scam", "cheated", "unauthorized transaction", "money stolen",
    "deducted without", "charge back", "complaint", "consumer court",
    "rbi", "ombudsman", "legal action", "police complaint", "cyber crime",
]

# ─── Helper Functions ────────────────────────────────────────────────────────

def detect_bank(text: str) -> Optional[str]:
    """
    Detect which Indian bank is mentioned in the user's message.

    Args:
        text: User's input message.

    Returns:
        Bank key (e.g. 'SBI', 'HDFC') or None if not detected.
    """
    text_lower = text.lower()
    for alias, bank_key in BANK_ALIASES.items():
        if alias in text_lower:
            return bank_key
    return None


def detect_service(text: str) -> Optional[str]:
    """
    Detect which banking service the user is asking about.

    Args:
        text: User's input message.

    Returns:
        Service key (e.g. 'balance_check', 'fund_transfer') or None.
    """
    text_lower = text.lower()
    for service, keywords in SERVICE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return service
    return None


def detect_automatable_service(text: str) -> Optional[str]:
    """
    Detect if the user is asking for an automatable service (EMI/FD calculator).

    Args:
        text: User's input message.

    Returns:
        'emi_calculator' | 'fd_calculator' | None
    """
    text_lower = text.lower()
    for service, keywords in AUTOMATABLE_SERVICES.items():
        for keyword in keywords:
            if keyword in text_lower:
                return service
    return None


def detect_escalation(text: str) -> bool:
    """
    Detect if the user's message indicates a situation requiring escalation.

    Args:
        text: User's input message.

    Returns:
        True if escalation keywords are found, else False.
    """
    text_lower = text.lower()
    return any(kw in text_lower for kw in ESCALATION_KEYWORDS)


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> dict:
    """
    Calculate EMI using standard formula: EMI = P*r*(1+r)^n / ((1+r)^n - 1)

    Args:
        principal: Loan amount in INR.
        annual_rate: Annual interest rate (e.g. 8.5 for 8.5%).
        tenure_months: Loan tenure in months.

    Returns:
        Dict with emi, total_payment, total_interest.
    """
    if annual_rate == 0:
        emi = principal / tenure_months
    else:
        r = annual_rate / 12 / 100  # monthly rate
        emi = principal * r * (1 + r) ** tenure_months / ((1 + r) ** tenure_months - 1)

    total_payment = emi * tenure_months
    total_interest = total_payment - principal

    return {
        "emi": round(emi, 2),
        "total_payment": round(total_payment, 2),
        "total_interest": round(total_interest, 2),
        "principal": principal,
        "annual_rate": annual_rate,
        "tenure_months": tenure_months,
    }


def calculate_fd_maturity(principal: float, annual_rate: float, tenure_years: float, compounding: str = "quarterly") -> dict:
    """
    Calculate Fixed Deposit maturity amount.

    Args:
        principal: Deposit amount in INR.
        annual_rate: Annual FD interest rate (e.g. 7.0 for 7%).
        tenure_years: Deposit tenure in years.
        compounding: 'quarterly' | 'monthly' | 'annually'.

    Returns:
        Dict with maturity_amount, interest_earned, effective_rate.
    """
    compounding_freq = {"quarterly": 4, "monthly": 12, "annually": 1}.get(compounding, 4)
    r = annual_rate / 100
    n = compounding_freq
    t = tenure_years

    maturity_amount = principal * (1 + r / n) ** (n * t)
    interest_earned = maturity_amount - principal

    return {
        "maturity_amount": round(maturity_amount, 2),
        "interest_earned": round(interest_earned, 2),
        "principal": principal,
        "annual_rate": annual_rate,
        "tenure_years": tenure_years,
        "compounding": compounding,
    }
