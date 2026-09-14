export const SCAM_SCENARIOS = [
  {
    id: 'digital_arrest_cbi',
    title: 'Digital Arrest & Money Laundering Scam',
    category: 'digital_arrest',
    riskExpectation: 'HIGH',
    callerName: 'Inspector Vijay Chauhan (Cyber Cell)',
    callerPhone: '+91 98201 54321',
    callerRole: 'Fake Mumbai Crime Branch Officer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Scammer falsely accuses you of a parcel seized with narcotics & bank accounts involved in 3.8 Crore money laundering, threatening immediate arrest under IPC 420/120B via Skype video call.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Hello, this is Senior Inspector Vijay Chauhan from Mumbai Crime Branch Cyber Cell. Am I speaking to the owner of this number?",
        suggestedUserResponses: [
          "Yes, who is this and why are you calling?",
          "What is this regarding officer?",
          "Yes speaking, please tell me."
        ],
        riskIncrease: 25
      },
      {
        step: 2,
        callerText: "Your Aadhaar number has been linked to 16 fraudulent bank accounts used in a 3.8 Crore money laundering syndicate. A non-bailable arrest warrant under IPC Section 420 and Section 120B has been issued by Supreme Court.",
        suggestedUserResponses: [
          "I have not done anything illegal! There must be a mistake.",
          "Can you send me the official notice or FIR copy?",
          "I am innocent, how is my Aadhaar involved?"
        ],
        riskIncrease: 40
      },
      {
        step: 3,
        callerText: "Do not cut the call or step out of the room! You are placed under 24-hour DIGITAL ARREST right now. Connect immediately on WhatsApp video call in uniform isolation for confidential CBI investigation verification.",
        suggestedUserResponses: [
          "There is no legal provision called digital arrest in Indian law.",
          "Why do I need to stay on video call?",
          "Please give me your police badge number and station address."
        ],
        riskIncrease: 25
      },
      {
        step: 4,
        callerText: "To clear your name from the asset seizure list, you must transfer your entire bank balance to the RBI Secret Verification Escrow Account. After RBI forensic audit, money will be returned in 15 minutes. Share your UPI PIN or transfer immediately.",
        suggestedUserResponses: [
          "I will never transfer money to any account or share my PIN.",
          "RBI never holds individual escrow accounts for court cases.",
          "I am reporting this call to 1930 Cyber Helpline."
        ],
        riskIncrease: 10
      }
    ]
  },
  {
    id: 'sbi_kyc_pan_threat',
    title: 'SBI / Bank KYC Expiry & OTP Theft',
    category: 'rbi_kyc',
    riskExpectation: 'HIGH',
    callerName: 'SBI Verification Manager Rajesh',
    callerPhone: '+91 80002 99881',
    callerRole: 'Impersonating State Bank of India',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    description: 'Scammer warns your SBI debit card and account will be blocked within 30 minutes unless you verify PAN and read out the 6-digit OTP code received.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Good day, I am calling from State Bank of India Central Card Division. Your SBI NetBanking and ATM card KYC document has expired today.",
        suggestedUserResponses: [
          "I recently updated my KYC at my local branch.",
          "Why are you calling from a mobile number for bank KYC?",
          "Which account number are you referring to?"
        ],
        riskIncrease: 20
      },
      {
        step: 2,
        callerText: "As per RBI mandate, your account will be frozen within 30 minutes and a penalty of 10,000 rupees will be deducted unless you update KYC immediately on this call.",
        suggestedUserResponses: [
          "I will visit my SBI branch in person tomorrow.",
          "Banks never block accounts in 30 minutes without written postal notice.",
          "Is there an official portal to check this?"
        ],
        riskIncrease: 35
      },
      {
        step: 3,
        callerText: "I have triggered a secure verification link to your SMS. Please open the link and tell me the 6-digit one-time password OTP you just received from SBI.",
        suggestedUserResponses: [
          "I will never share OTP with anyone on call!",
          "The SMS clearly says 'Do not share OTP with bank staff'.",
          "Why do you need OTP for KYC update?"
        ],
        riskIncrease: 40
      }
    ]
  },
  {
    id: 'fedex_customs_narcotics',
    title: 'FedEx Customs Parcel Narcotics Scam',
    category: 'customs_parcel',
    riskExpectation: 'HIGH',
    callerName: 'FedEx Customs Terminal Mumbai',
    callerPhone: '+91 77382 11094',
    callerRole: 'Fake Customs Clearance Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    description: 'Claims a parcel sent to Taiwan in your name contains 5 passports, 140g MDMA narcotics, and laptops. Demands urgent clearance fee to avoid NCB raid.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Important alert from FedEx International Hub Mumbai. A parcel registered under your name and Aadhaar addressed to Taipei, Taiwan was intercepted by Customs.",
        suggestedUserResponses: [
          "I haven't sent any parcel to Taiwan!",
          "What tracking number is on the parcel?",
          "Are you sure it has my details?"
        ],
        riskIncrease: 25
      },
      {
        step: 2,
        callerText: "The package contains 5 fake passports, 140 grams of illegal MDMA contraband, and 3 credit cards. Narcotics Control Bureau NCB has already registered FIR No. 892.",
        suggestedUserResponses: [
          "Someone must have misused my stolen identity documents.",
          "I want to connect directly with the official Mumbai Customs helpline.",
          "I will consult my legal counsel before speaking further."
        ],
        riskIncrease: 40
      },
      {
        step: 3,
        callerText: "We are transferring you to the NCB Duty Officer. You must deposit 45,000 security bond via Quick UPI to avoid immediate remand and search warrant.",
        suggestedUserResponses: [
          "Government enforcement agencies never take bail bonds over UPI!",
          "This is an obvious extortion racket.",
          "Disconnecting and alerting the cybercrime authorities."
        ],
        riskIncrease: 30
      }
    ]
  },
  {
    id: 'electricity_bill_urgent',
    title: 'Electricity Bill Immediate Power Cut Scam',
    category: 'electricity_threat',
    riskExpectation: 'HIGH',
    callerName: 'Electricity Board Power Officer',
    callerPhone: '+91 94110 33490',
    callerRole: 'Fake Power Board Disconnection Desk',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    description: 'Threatens power cutoff at 9:30 PM due to unpaid bill update, urging you to install QuickSupport/AnyDesk app or pay immediately.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM from the main power grid because your previous month bill update was not received.",
        suggestedUserResponses: [
          "I have already paid my bill via the official electricity portal.",
          "What is my consumer CA number?",
          "I have the payment receipt with me."
        ],
        riskIncrease: 20
      },
      {
        step: 2,
        callerText: "Our central billing server is showing pending status. You need to download the official Power Support APK link I sent on WhatsApp to update the meter token.",
        suggestedUserResponses: [
          "Why are you asking me to download an APK file from WhatsApp?",
          "I only use the official government electricity app.",
          "I won't install any remote screen sharing application."
        ],
        riskIncrease: 45
      },
      {
        step: 3,
        callerText: "If you don't install the APK and recharge 10 rupees immediately, the line disconnection team is already outside your building.",
        suggestedUserResponses: [
          "This is a known APK remote-access Trojan scam.",
          "I am blocking this number and contacting my substation directly."
        ],
        riskIncrease: 30
      }
    ]
  },
  {
    id: 'family_doctor_safe',
    title: 'Authentic Call: Dr. Ananya Sharma (Clinic)',
    category: 'safe_personal',
    riskExpectation: 'LOW',
    callerName: 'Dr. Ananya Sharma',
    callerPhone: '+91 98111 22334',
    callerRole: 'Family Physician / Health Clinic',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    description: 'A genuine routine check-up call from your family doctor discussing annual blood test reports and scheduling a regular appointment.',
    dialogueSteps: [
      {
        step: 1,
        callerText: "Hi there! This is Dr. Ananya from City Health Care. Calling to follow up on your recent annual health check-up blood tests.",
        suggestedUserResponses: [
          "Hi Dr. Ananya, thank you for calling. Are the reports in?",
          "Hello doctor, how do the results look?",
          "Good afternoon doctor, is everything normal?"
        ],
        riskIncrease: 0
      },
      {
        step: 2,
        callerText: "Overall your vitals and cholesterol are in a healthy range. Your Vitamin D3 is slightly low, so I have emailed a prescription for a mild supplement.",
        suggestedUserResponses: [
          "Thank you doctor, should I schedule a follow-up next month?",
          "Got the email, thank you so much for the advice.",
          "I will start the supplement as recommended."
        ],
        riskIncrease: 0
      },
      {
        step: 3,
        callerText: "Take care and stay hydrated! You can book a regular 6-month checkup whenever convenient via the clinic reception. Have a great day!",
        suggestedUserResponses: [
          "Thank you Dr. Ananya, have a wonderful day!",
          "Thanks a lot doctor, take care."
        ],
        riskIncrease: 0
      }
    ]
  }
];
