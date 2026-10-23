export const SCAM_SCENARIOS = [
  {
    id: 'digital_arrest_cbi',
    title: 'Digital Arrest & Money Laundering Extortion',
    category: 'digital_arrest',
    categoryLabel: 'Police Impersonation',
    riskExpectation: 'HIGH',
    callerName: 'Inspector Vijay Chauhan (Cyber Cell)',
    callerPhone: '+91 98201 54321',
    callerRole: 'Fake Mumbai Crime Branch Officer',
    location: 'Mumbai Cyber Crime Cell (Spoofed Line)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tactics: ['Digital Arrest Threat', 'Fake Supreme Court Warrant', 'Court Escrow Account', 'Video Isolation'],
    legalSectionCited: 'IPC Sec 420 / 120B (Fabricated)',
    counterAdvisory: 'Indian law has NO provision for Digital Arrest. Real police never interrogate or demand bail over phone.',
    description: 'Scammer falsely accuses you of an intercepted narcotic parcel & 16 fraudulent bank accounts linked to a ₹3.8 Crore money laundering syndicate. Demands 24-hr digital arrest on Skype and transfer of funds to an RBI verification escrow account.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Hello, this is Senior Inspector Vijay Chauhan from Mumbai Crime Branch Cyber Cell. Am I speaking to the registered subscriber of this number?",
        suggestedUserResponses: [
          "Yes, who is this and why are you calling?",
          "What is this regarding officer?",
          "Yes speaking, please tell me."
        ],
        riskIncrease: 25,
        flaggedKeywords: ['Crime Branch', 'Cyber Cell', 'Inspector']
      },
      {
        step: 2,
        callerText: "Your Aadhaar number has been linked to 16 fraudulent bank accounts used in a 3.8 Crore money laundering syndicate. A non-bailable arrest warrant under IPC Section 420 and Section 120B has been signed by the Supreme Court.",
        suggestedUserResponses: [
          "I have not done anything illegal! There must be a mistake.",
          "Can you send me the official notice or FIR copy?",
          "I am innocent, how is my Aadhaar involved?"
        ],
        riskIncrease: 30,
        flaggedKeywords: ['Aadhaar', 'money laundering', 'arrest warrant', 'IPC Section 420', 'Supreme Court']
      },
      {
        step: 3,
        callerText: "Do not cut the call or step out of the room! You are placed under 24-hour DIGITAL ARREST right now. Connect immediately on WhatsApp video call in uniform isolation for confidential CBI investigation verification.",
        suggestedUserResponses: [
          "There is no legal provision called digital arrest in Indian law.",
          "Why do I need to stay on video call?",
          "Please give me your police badge number and station address."
        ],
        riskIncrease: 25,
        flaggedKeywords: ['DIGITAL ARREST', 'WhatsApp video call', 'confidential CBI investigation']
      },
      {
        step: 4,
        callerText: "To clear your name from the asset seizure list, you must transfer your entire bank balance to the RBI Secret Verification Escrow Account. After RBI forensic audit, money will be returned in 15 minutes. Share your UPI PIN or transfer immediately.",
        suggestedUserResponses: [
          "I will never transfer money to any account or share my PIN.",
          "RBI never holds individual escrow accounts for court cases.",
          "I am disconnecting and reporting this call to 1930 Cyber Helpline."
        ],
        riskIncrease: 20,
        flaggedKeywords: ['asset seizure', 'RBI Secret Verification Escrow', 'UPI PIN', 'transfer immediately']
      }
    ]
  },
  {
    id: 'sbi_kyc_pan_threat',
    title: 'SBI / Bank KYC Expiry & OTP Theft',
    category: 'rbi_kyc',
    categoryLabel: 'Banking / Phishing',
    riskExpectation: 'HIGH',
    callerName: 'SBI Verification Desk (Rajesh)',
    callerPhone: '+91 80002 99881',
    callerRole: 'Impersonating State Bank of India Manager',
    location: 'SBI Central Verification Hub',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    tactics: ['Urgent Account Freeze', 'RBI Mandate Pressure', 'OTP Solicitation'],
    legalSectionCited: 'RBI Master Circular on KYC (Misquoted)',
    counterAdvisory: 'Banks never call from mobile numbers demanding OTPs or threatening 30-minute account closure.',
    description: 'Scammer warns your SBI debit card and net banking account will be blocked within 30 minutes unless you verify your PAN and read out the 6-digit OTP code received on your phone.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Good day, I am calling from State Bank of India Central Card Division. Your SBI NetBanking and ATM card KYC document has expired today.",
        suggestedUserResponses: [
          "I recently updated my KYC at my local branch.",
          "Why are you calling from a mobile number for bank KYC?",
          "Which account number are you referring to?"
        ],
        riskIncrease: 20,
        flaggedKeywords: ['State Bank of India', 'KYC document has expired']
      },
      {
        step: 2,
        callerText: "As per RBI mandate, your account will be frozen within 30 minutes and a penalty of 10,000 rupees will be deducted unless you update KYC immediately on this call.",
        suggestedUserResponses: [
          "I will visit my SBI branch in person tomorrow.",
          "Banks never block accounts in 30 minutes without written postal notice.",
          "Is there an official portal to check this?"
        ],
        riskIncrease: 35,
        flaggedKeywords: ['RBI mandate', 'frozen within 30 minutes', 'penalty']
      },
      {
        step: 3,
        callerText: "I have triggered a secure verification link to your SMS. Please open the link and tell me the 6-digit one-time password OTP you just received from SBI.",
        suggestedUserResponses: [
          "I will never share OTP with anyone on call!",
          "The SMS clearly says 'Do not share OTP with bank staff'.",
          "Why do you need OTP for KYC update?"
        ],
        riskIncrease: 40,
        flaggedKeywords: ['verification link', 'one-time password', 'OTP']
      }
    ]
  },
  {
    id: 'fedex_customs_narcotics',
    title: 'FedEx Customs Parcel Narcotics Scam',
    category: 'customs_parcel',
    categoryLabel: 'Customs & Contraband',
    riskExpectation: 'HIGH',
    callerName: 'FedEx Customs Terminal Mumbai',
    callerPhone: '+91 77382 11094',
    callerRole: 'Fake Customs Clearance Officer',
    location: 'Chhatrapati Shivaji International Cargo Terminal',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    tactics: ['Contraband Accusation', 'NCB Remand Threat', 'Instant UPI Bail Bond'],
    legalSectionCited: 'NDPS Act (Fabricated FIR)',
    counterAdvisory: 'Customs and NCB never demand bail or bond payments via UPI or personal bank transfers.',
    description: 'Claims a parcel sent to Taiwan in your name contains 5 fake passports, 140g MDMA narcotics, and laptops. Demands urgent clearance fee to avoid immediate Narcotics Control Bureau (NCB) raid.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Important alert from FedEx International Hub Mumbai. A parcel registered under your name and Aadhaar addressed to Taipei, Taiwan was intercepted by Customs.",
        suggestedUserResponses: [
          "I haven't sent any parcel to Taiwan!",
          "What tracking number is on the parcel?",
          "Are you sure it has my details?"
        ],
        riskIncrease: 25,
        flaggedKeywords: ['FedEx', 'intercepted by Customs', 'parcel']
      },
      {
        step: 2,
        callerText: "The package contains 5 fake passports, 140 grams of illegal MDMA contraband, and 3 credit cards. Narcotics Control Bureau NCB has already registered FIR No. 892.",
        suggestedUserResponses: [
          "Someone must have misused my stolen identity documents.",
          "I want to connect directly with the official Mumbai Customs helpline.",
          "I will consult my legal counsel before speaking further."
        ],
        riskIncrease: 40,
        flaggedKeywords: ['MDMA contraband', 'Narcotics Control Bureau', 'NCB', 'FIR']
      },
      {
        step: 3,
        callerText: "We are transferring you to the NCB Duty Officer. You must deposit 45,000 security bond via Quick UPI to avoid immediate remand and search warrant.",
        suggestedUserResponses: [
          "Government enforcement agencies never take bail bonds over UPI!",
          "This is an obvious extortion racket.",
          "Disconnecting and alerting the cybercrime authorities."
        ],
        riskIncrease: 30,
        flaggedKeywords: ['deposit', 'security bond', 'Quick UPI', 'search warrant']
      }
    ]
  },
  {
    id: 'electricity_bill_urgent',
    title: 'Electricity Bill Immediate Power Cut Scam',
    category: 'electricity_threat',
    categoryLabel: 'Utility Threat',
    riskExpectation: 'HIGH',
    callerName: 'Electricity Board Power Officer',
    callerPhone: '+91 94110 33490',
    callerRole: 'Fake Power Board Disconnection Desk',
    location: 'State Electricity Distribution Co.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    tactics: ['Urgent Disconnection', 'Untrusted APK Download', 'Remote Screen Access Trojan'],
    legalSectionCited: 'Electricity Act Sec 56 (Misrepresented)',
    counterAdvisory: 'Electricity boards never demand payment via WhatsApp APK files or AnyDesk screen sharing.',
    description: 'Threatens power cutoff tonight at 9:30 PM due to unpaid bill update, urging you to install QuickSupport or an APK file link sent on WhatsApp.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM from the main power grid because your previous month bill update was not received.",
        suggestedUserResponses: [
          "I have already paid my bill via the official electricity portal.",
          "What is my consumer CA number?",
          "I have the payment receipt with me."
        ],
        riskIncrease: 20,
        flaggedKeywords: ['disconnected tonight at 9:30 PM', 'power grid']
      },
      {
        step: 2,
        callerText: "Our central billing server is showing pending status. You need to download the official Power Support APK link I sent on WhatsApp to update the meter token.",
        suggestedUserResponses: [
          "Why are you asking me to download an APK file from WhatsApp?",
          "I only use the official government electricity app.",
          "I won't install any remote screen sharing application."
        ],
        riskIncrease: 45,
        flaggedKeywords: ['download', 'Power Support APK', 'WhatsApp']
      },
      {
        step: 3,
        callerText: "If you don't install the APK and recharge 10 rupees immediately, the line disconnection team is already outside your building.",
        suggestedUserResponses: [
          "This is a known APK remote-access Trojan scam.",
          "I am blocking this number and contacting my substation directly."
        ],
        riskIncrease: 30,
        flaggedKeywords: ['install the APK', 'recharge 10 rupees', 'disconnection team']
      }
    ]
  },
  {
    id: 'telegram_wfh_task_scam',
    title: 'Work-From-Home / YouTube Task Scam',
    category: 'task_investment',
    categoryLabel: 'Job & Investment',
    riskExpectation: 'HIGH',
    callerName: 'Pooja HR (Global Media Recruitment)',
    callerPhone: '+91 97120 44821',
    callerRole: 'Fake Part-Time Job Recruiter',
    location: 'Telegram Recruitment Agency',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tactics: ['High Return Lure', 'Prepaid Crypto Task', 'Telegram Group Pressure'],
    legalSectionCited: 'Prize Chits and Money Circulation Schemes Act',
    counterAdvisory: 'Legitimate employers never ask you to pay or recharge cryptocurrency to receive salary.',
    description: 'Prompts you to like 3 YouTube videos for ₹150 each, then coerces you into depositing ₹5,000 in a fake crypto trading pool to unlock your ₹18,000 earnings.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Hi! I am Pooja from Global Digital HR. We have part-time work from home reviewing YouTube videos. You can earn ₹3,000 to ₹5,000 daily from your phone.",
        suggestedUserResponses: [
          "Where did you get my number?",
          "What company do you represent?",
          "Can you share the official website and contract?"
        ],
        riskIncrease: 20,
        flaggedKeywords: ['earn ₹3,000 to ₹5,000 daily', 'part-time work from home']
      },
      {
        step: 2,
        callerText: "We already credited ₹150 for your test task. Now to unlock your VIP Level-2 merchant wallet, you must complete a prepaid cryptocurrency task by depositing ₹5,000 on Telegram.",
        suggestedUserResponses: [
          "Why do I have to pay money to get my salary?",
          "This sounds like a prepaid recharge fraud scheme.",
          "I will not transfer any funds into an unknown wallet."
        ],
        riskIncrease: 45,
        flaggedKeywords: ['VIP Level-2 merchant wallet', 'prepaid cryptocurrency task', 'depositing ₹5,000']
      },
      {
        step: 3,
        callerText: "If you don't recharge within 10 minutes, your account will be frozen and you will forfeit all ₹18,000 earnings. Recharges are 100% refundable with 40% commission.",
        suggestedUserResponses: [
          "No legitimate job requires upfront investment.",
          "I am disconnecting and filing a cybercrime report."
        ],
        riskIncrease: 30,
        flaggedKeywords: ['account will be frozen', 'forfeit', '40% commission']
      }
    ]
  },
  {
    id: 'kbc_lottery_upi_scam',
    title: 'KBC / ₹25 Lakh Lottery UPI Cashback Trap',
    category: 'lottery_fraud',
    categoryLabel: 'Lottery & Cashback',
    riskExpectation: 'HIGH',
    callerName: 'Rana Pratap Singh (KBC Secretary)',
    callerPhone: '+91 93214 77800',
    callerRole: 'Fake KBC Head Office Executive',
    location: 'Mumbai Film City / KBC Desk',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    tactics: ['Greed Lure', 'GST Tax Fee Extortion', 'Fake Government Certificate'],
    legalSectionCited: 'Lotteries (Regulation) Act',
    counterAdvisory: 'KBC and lottery prizes never require upfront GST fee transfers via Google Pay or PhonePe.',
    description: 'Claims your SIM card was selected in a mega lottery draw winning ₹25,00,000 cash. Requires urgent payment of ₹12,500 government tax fee via PhonePe to release funds.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Congratulations! I am Rana Pratap Singh from KBC Head Office Mumbai. Your mobile SIM has won ₹25 Lakh in the All-India Mega Lucky Draw!",
        suggestedUserResponses: [
          "I never entered any lottery or watched KBC contest.",
          "How did my number get selected?",
          "Send the official notification letter."
        ],
        riskIncrease: 25,
        flaggedKeywords: ['won ₹25 Lakh', 'KBC Head Office', 'Mega Lucky Draw']
      },
      {
        step: 2,
        callerText: "Your winning cheque is ready with State Bank of India. But to disburse the funds, government GST tax of ₹12,500 must be paid right now via PhonePe or Google Pay.",
        suggestedUserResponses: [
          "Taxes are deducted at source (TDS), not paid upfront via UPI.",
          "Why can't you deduct ₹12,500 from the ₹25 Lakh prize money?",
          "This is a classic advance-fee lottery scam."
        ],
        riskIncrease: 40,
        flaggedKeywords: ['government GST tax', 'PhonePe', 'Google Pay', 'paid right now']
      },
      {
        step: 3,
        callerText: "If tax is not cleared within 15 minutes, your prize voucher will be cancelled and passed to the next contestant. Scan the QR code sent on your WhatsApp immediately.",
        suggestedUserResponses: [
          "I will not pay a single rupee.",
          "Reporting your number to TRAI and Cyber Cell 1930."
        ],
        riskIncrease: 30,
        flaggedKeywords: ['prize voucher will be cancelled', 'Scan the QR code', 'WhatsApp immediately']
      }
    ]
  },
  {
    id: 'family_doctor_safe',
    title: 'Authentic Call: Dr. Ananya Sharma (Clinic)',
    category: 'safe_personal',
    categoryLabel: 'Authentic / Medical',
    riskExpectation: 'LOW',
    callerName: 'Dr. Ananya Sharma',
    callerPhone: '+91 98111 22334',
    callerRole: 'Family Physician / Health Clinic',
    location: 'City Health Clinic, Indiranagar',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    tactics: ['Routine Medical Follow-up', 'Zero Coercion', 'Legitimate Advice'],
    legalSectionCited: 'None (Safe Call)',
    counterAdvisory: 'Normal conversation. No threat detected.',
    description: 'A genuine routine check-up call from your family doctor discussing annual blood test reports and scheduling a regular appointment. Use this to verify safe call detection.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Hi there! This is Dr. Ananya from City Health Care. Calling to follow up on your recent annual health check-up blood tests.",
        suggestedUserResponses: [
          "Hi Dr. Ananya, thank you for calling. Are the reports in?",
          "Hello doctor, how do the results look?",
          "Good afternoon doctor, is everything normal?"
        ],
        riskIncrease: 0,
        flaggedKeywords: []
      },
      {
        step: 2,
        callerText: "Overall your vitals and cholesterol are in a healthy range. Your Vitamin D3 is slightly low, so I have emailed a prescription for a mild supplement.",
        suggestedUserResponses: [
          "Thank you doctor, should I schedule a follow-up next month?",
          "Got the email, thank you so much for the advice.",
          "I will start the supplement as recommended."
        ],
        riskIncrease: 0,
        flaggedKeywords: []
      },
      {
        step: 3,
        callerText: "Take care and stay hydrated! You can book a regular 6-month checkup whenever convenient via the clinic reception. Have a great day!",
        suggestedUserResponses: [
          "Thank you Dr. Ananya, have a wonderful day!",
          "Thanks a lot doctor, take care."
        ],
        riskIncrease: 0,
        flaggedKeywords: []
      }
    ]
  }
];
