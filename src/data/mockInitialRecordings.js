export const INITIAL_RECORDINGS = [
  {
    id: 'rec-1740924100000',
    contactName: 'Inspector Vijay Chauhan (Suspected)',
    phoneNumber: '+91 98201 54321',
    direction: 'incoming',
    startedAt: '2026-03-02T10:14:00.000Z',
    durationSeconds: 142,
    audioDataBase64: null,
    audioMimeType: 'audio/wav',
    fileSizeBytes: 245600,
    sha256Hash: 'a8f4c219803bf7e10c7da54b6321487ea93efcb592014cd7612f01a3962b1a0e',
    isEncryptedLocally: true,
    consentGranted: true,
    consentTimestamp: '2026-03-02T10:14:02.000Z',
    consentProof: 'CONSENT_STATUTORY_EXPLICIT_OPTIN_SHA256:a8f4c219803bf7e1',
    transcript: [
      { speaker: 'caller', text: 'This is Inspector Chauhan from Mumbai Cyber Cell. A non-bailable FIR is registered against your Aadhaar.' },
      { speaker: 'user', text: 'What FIR? I have never been to Mumbai recently.' },
      { speaker: 'caller', text: 'A parcel containing banned contraband and 5 fake debit cards was seized at airport customs under your name. You are under Digital Arrest.' },
      { speaker: 'caller', text: 'Do not disconnect this line or police teams will be dispatched to your residence immediately. You must transfer ₹3,80,000 security deposit to court escrow account right now.' },
      { speaker: 'user', text: 'I need to consult my lawyer first before doing anything.' },
      { speaker: 'caller', text: 'No lawyer! This is an emergency judicial order under Section 420 and 120B. Transfer the verification amount immediately or face immediate arrest.' }
    ],
    fraudAnalysis: {
      overallRiskScore: 96,
      riskLevel: 'HIGH',
      scamType: 'Digital Arrest & Law Enforcement Impersonation',
      confidence: 0.98,
      detectedIndicators: [
        'Unlawful "Digital Arrest" threat',
        'Coercive isolation ("Do not disconnect")',
        'Urgent financial transfer to escrow account',
        'Impersonation of Mumbai Cyber Police'
      ],
      intentClassification: {
        primaryIntent: 'coercion_extortion',
        intentScore: 96
      },
      xaiExplanation: {
        summary: 'High-risk fraud detected: The caller exhibits aggressive patterns of Digital Arrest extortion and unlawful intimidation using forged police authority.',
        factors: [
          { name: 'Digital Arrest Coercion', category: 'threat', weight: 98, description: 'Fabricated legal warrant and arrest threat contrary to CrPC.' },
          { name: 'Financial Demand', category: 'financial', weight: 94, description: 'Demand for ₹3,80,000 unverified escrow deposit.' }
        ]
      },
      verification: {
        claimedOrg: 'Mumbai Cyber Crime Branch',
        isRecognizedOrg: true,
        officialStatus: 'HIGH_PROBABILITY_IMPERSONATION',
        directoryMatchScore: 8,
        ragLegalCheck: {
          legalSectionCited: 'IPC Section 420 & 120B',
          isLegallyValidProcedure: false,
          explanation: 'Digital Arrest has NO legal standing under Indian Criminal Procedure Code. Supreme Court guidelines prohibit arrest over telephone.'
        },
        voiceAnalysis: {
          anomalyScore: 78,
          isSyntheticLikelihood: 'SUSPICIOUS',
          confidence: 0.91
        }
      },
      preventiveGuidance: [
        'Never transfer funds to any account claimed to be "court escrow".',
        'Hang up immediately and call national helpline 1930.',
        'File formal report with evidence hash on cybercrime.gov.in.'
      ],
      recommendedActions: [
        'Immediate call termination.',
        'Preserve recording hash for cybercell evidentiary submission.'
      ],
      analyzedAt: '2026-03-02T10:16:22.000Z'
    },
    cloudBackup: {
      status: 'SYNCED',
      cloudBucket: 'safecall-secure-vault-asia-s3',
      cloudKey: 'vault/recordings/2026/3/rec-1740924100000.enc.wav',
      uploadedAt: '2026-03-02T10:16:30.000Z',
      encryptionAlgorithm: 'AES-256-GCM',
      backupReceiptToken: 'REC-AES256-VC892-1740924100000'
    }
  },
  {
    id: 'rec-1740837700000',
    contactName: 'FedEx Customs Hub (Fake)',
    phoneNumber: '+91 77382 11094',
    direction: 'incoming',
    startedAt: '2026-03-01T15:20:00.000Z',
    durationSeconds: 86,
    audioDataBase64: null,
    audioMimeType: 'audio/wav',
    fileSizeBytes: 189000,
    sha256Hash: '5e37bc44919cb42817ea8941cf13b960a58a7410de93c834903348123ad84e03',
    isEncryptedLocally: true,
    consentGranted: true,
    consentTimestamp: '2026-03-01T15:20:03.000Z',
    consentProof: 'CONSENT_STATUTORY_EXPLICIT_OPTIN_SHA256:5e37bc44919cb428',
    transcript: [
      { speaker: 'caller', text: 'This is automated courier department. Your consignment to Taiwan has been confiscated.' },
      { speaker: 'user', text: 'I didn’t send any parcel to Taiwan.' },
      { speaker: 'caller', text: 'Your passport was used to send 140 grams of MDMA. Connecting you to Narcotics Control Bureau officer.' },
      { speaker: 'caller', text: 'To avoid customs seizure penalty, pay ₹45,000 clearance tax on this link.' }
    ],
    fraudAnalysis: {
      overallRiskScore: 92,
      riskLevel: 'HIGH',
      scamType: 'Customs & Courier Contraband Threat',
      confidence: 0.95,
      detectedIndicators: [
        'Narcotics / customs contraband allegation',
        'Passport identity exploitation claim',
        'Immediate clearance tax payment demand'
      ],
      intentClassification: {
        primaryIntent: 'credential_financial_extortion',
        intentScore: 92
      },
      xaiExplanation: {
        summary: 'High-risk parcel scam: Impersonating logistics provider with synthetic Narcotics Bureau transfer.',
        factors: [
          { name: 'Contraband Allegation', category: 'threat', weight: 95, description: 'False narcotics smuggling claim to induce panic.' }
        ]
      },
      verification: {
        claimedOrg: 'Customs Clearance Mumbai Hub',
        isRecognizedOrg: true,
        officialStatus: 'HIGH_PROBABILITY_IMPERSONATION',
        directoryMatchScore: 11,
        ragLegalCheck: {
          isLegallyValidProcedure: false,
          explanation: 'Customs notifications are delivered via formal registered speed post, never via phone demand.'
        },
        voiceAnalysis: {
          anomalyScore: 65,
          isSyntheticLikelihood: 'LOW',
          confidence: 0.85
        }
      },
      preventiveGuidance: [
        'Do not click courier tracking payment links sent via SMS.',
        'Report suspect number to 1930.'
      ],
      recommendedActions: ['Disconnect and block caller.'],
      analyzedAt: '2026-03-01T15:21:30.000Z'
    },
    cloudBackup: {
      status: 'SYNCED',
      cloudBucket: 'safecall-secure-vault-asia-s3',
      cloudKey: 'vault/recordings/2026/3/rec-1740837700000.enc.wav',
      uploadedAt: '2026-03-01T15:21:40.000Z',
      encryptionAlgorithm: 'AES-256-GCM',
      backupReceiptToken: 'REC-AES256-FX110-1740837700000'
    }
  },
  {
    id: 'rec-1740751300000',
    contactName: 'Aarav Mehta (Brother)',
    phoneNumber: '+91 98200 11223',
    direction: 'incoming',
    startedAt: '2026-02-28T18:45:00.000Z',
    durationSeconds: 195,
    audioDataBase64: null,
    audioMimeType: 'audio/wav',
    fileSizeBytes: 310000,
    sha256Hash: '93f18e9bc7419e0481cfba82944a980e61d8a43588efc6130981d39029e84011',
    isEncryptedLocally: true,
    consentGranted: true,
    consentTimestamp: '2026-02-28T18:45:02.000Z',
    consentProof: 'CONSENT_STATUTORY_EXPLICIT_OPTIN_SHA256:93f18e9bc7419e04',
    transcript: [
      { speaker: 'caller', text: 'Hey, are you free this weekend? Mom asked if we could meet for dinner.' },
      { speaker: 'user', text: 'Yes, Saturday evening works great for me.' },
      { speaker: 'caller', text: 'Awesome, I will reserve a table at the usual spot and share the directions.' }
    ],
    fraudAnalysis: {
      overallRiskScore: 4,
      riskLevel: 'LOW',
      scamType: 'Legitimate Personal Call',
      confidence: 0.99,
      detectedIndicators: ['Natural dialogue patterns', 'Known family contact'],
      intentClassification: {
        primaryIntent: 'personal_social',
        intentScore: 99
      },
      xaiExplanation: {
        summary: 'Safe call: No malicious intent, pressure tactics, or financial demands detected.',
        factors: [
          { name: 'Conversational Legitimacy', category: 'intent', weight: 99, description: 'Routine family social dialogue.' }
        ]
      },
      verification: {
        claimedOrg: 'Family Contact',
        isRecognizedOrg: false,
        officialStatus: 'NONE',
        directoryMatchScore: 100,
        ragLegalCheck: {
          isLegallyValidProcedure: true,
          explanation: 'Standard private telecommunication.'
        },
        voiceAnalysis: {
          anomalyScore: 3,
          isSyntheticLikelihood: 'LOW',
          confidence: 0.95
        }
      },
      preventiveGuidance: ['Call exhibits normal conversational characteristics.'],
      recommendedActions: ['No protective action required.'],
      analyzedAt: '2026-02-28T18:48:20.000Z'
    },
    cloudBackup: {
      status: 'NOT_BACKED_UP',
      encryptionAlgorithm: 'AES-256-GCM'
    }
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'NCCRP-2026-03914',
    recordingId: 'rec-1740924100000',
    incidentCategory: 'Digital Arrest & Law Enforcement Impersonation',
    incidentDate: '2026-03-02T10:14:00.000Z',
    suspectNumber: '+91 98201 54321',
    claimedIdentity: 'Inspector Vijay Chauhan (Fake Police)',
    claimedOrganization: 'Mumbai Cyber Crime Branch / CBI',
    demandedAmount: '₹3,80,000 (Escrow Demand)',
    demandedPaymentMode: 'Immediate RTGS / Escrow Transfer',
    summaryNarrative: 'The suspect placed the victim under unlawful "Digital Arrest", falsely alleging a narcotics parcel in Mumbai customs with non-bailable arrest warrants. The caller strictly forbade disconnecting the call or consulting legal counsel, and demanded ₹3,80,000 deposit into a fake judicial escrow account.',
    suspiciousStatements: [
      'You are placed under immediate Digital Arrest by Mumbai Cyber Cell.',
      'A parcel with banned contraband was seized under your Aadhaar number.',
      'Do not disconnect this line or arrest teams will enter your home.',
      'Transfer ₹3,80,000 security deposit to court escrow account right now.'
    ],
    legalViolations: [
      'IT Act Section 66D: Impersonation by using computer resource',
      'IPC Section 420: Cheating and dishonestly inducing delivery of property',
      'IPC Section 384: Extortion under threat of fake arrest',
      'IPC Section 419: Punishment for cheating by personation'
    ],
    evidencePackageHash: 'a8f4c219803bf7e10c7da54b6321487ea93efcb592014cd7612f01a3962b1a0e',
    status: 'READY_FOR_SUBMISSION',
    generatedAt: '2026-03-02T10:18:00.000Z'
  }
];
