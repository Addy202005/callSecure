/**
 * Real-Time Phrase Detection & Manipulative Language Analysis Service
 * Scans incoming speech-to-text tokens in real-time, detecting coercive, deceptive,
 * and high-risk fraudulent phrases commonly used in digital arrest, banking OTP theft,
 * fake customs parcels, and urgent financial transfer scams.
 */

export const PHRASE_PATTERNS = [
  // 1. Digital Arrest & Law Enforcement Impersonation (CRITICAL)
  {
    regex: /\b(digital arrest|digitally arrested|digital remand|online arrest)\b/gi,
    category: 'legal_extortion',
    categoryLabel: 'Fabricated Legal Term (Digital Arrest)',
    severity: 'CRITICAL',
    weight: 45,
    explanation: 'Indian Law (CrPC/BNSS) has NO concept of "Digital Arrest". Police, CBI, ED, and courts never arrest or detain citizens over phone or video calls.',
    counterAdvisory: 'Immediately disconnect. No law enforcement agency conducts court hearings or arrests via WhatsApp or Skype.'
  },
  {
    regex: /\b(non[- ]?bailable (?:arrest )?warrant|arrest warrant|supreme court warrant)\b/gi,
    category: 'legal_extortion',
    categoryLabel: 'Unverified Arrest Warrant Threat',
    severity: 'CRITICAL',
    weight: 40,
    explanation: 'Arrest warrants cannot be served over telephony calls. Warrants must be physically presented by uniformed officers under Section 70/72 CrPC.',
    counterAdvisory: 'Do not panic. Demand an official physical summon served through your local jurisdiction police station.'
  },
  {
    regex: /\b(supreme court(?: order)?|cbi investigation|crime branch|cyber cell|police commissioner|anti[- ]terror(?: squad)?)\b/gi,
    category: 'authority_impersonation',
    categoryLabel: 'High-Level Agency Impersonation',
    severity: 'HIGH',
    weight: 35,
    explanation: 'Scammers invoke high-level agencies (Supreme Court, CBI, Crime Branch) to intimidate victims and eliminate skepticism.',
    counterAdvisory: 'Verify officer identity independently through the official jurisdictional police telephone directory.'
  },
  {
    regex: /\b(ipc section 420|section 120b|section 420|money laundering syndicates?|money laundering)\b/gi,
    category: 'legal_extortion',
    categoryLabel: 'Criminal Accusation & Section Citation',
    severity: 'HIGH',
    weight: 35,
    explanation: 'Citing penal sections (IPC 420 Cheating / 120B Conspiracy) is an intimidation tactic used to induce overwhelming fear.',
    counterAdvisory: 'Real investigations require registered written summons (Section 41A CrPC), not verbal phone intimidation.'
  },

  // 2. Credential & OTP Theft (CRITICAL)
  {
    regex: /\b(share your upi pin|upi pin|6[- ]?digit otp|one[- ]?time password|otp|netbanking password|atm pin|cvv(?: number)?|debit card pin|verification code)\b/gi,
    category: 'credential_theft',
    categoryLabel: 'Banking Credential & OTP Theft',
    severity: 'CRITICAL',
    weight: 45,
    explanation: 'STRICT VIOLATION: Genuine bank staff or government officials are legally prohibited from ever requesting OTPs, PINs, or passwords.',
    counterAdvisory: 'NEVER read out or type OTPs/PINs. Giving this code authorizes an immediate irreversible financial transfer.'
  },
  {
    regex: /\b(read out the otp|send me the code|tell me the otp|enter your secret pin|verify your mpim)\b/gi,
    category: 'credential_theft',
    categoryLabel: 'Direct Solicitation of Secret Auth',
    severity: 'CRITICAL',
    weight: 45,
    explanation: 'The caller is actively attempting to authenticate a fraudulent debit transaction or login session using your personal credentials.',
    counterAdvisory: 'Block this caller immediately. Check your bank SMS alerts for unauthorized withdrawal attempts.'
  },

  // 3. Fake Escrow & Financial Demands (CRITICAL)
  {
    regex: /\b(rbi (?:secret )?verification escrow account|rbi escrow|secret escrow|verification escrow|rbi security deposit)\b/gi,
    category: 'escrow_coercion',
    categoryLabel: 'Fabricated RBI Escrow Account Trap',
    severity: 'CRITICAL',
    weight: 42,
    explanation: 'The Reserve Bank of India (RBI) does NOT maintain public escrow or clearance accounts. Any "RBI verification transfer" is 100% fraudulent.',
    counterAdvisory: 'Never transfer funds to "verify" your bank balance. Transferred funds are instantly routed through mule accounts.'
  },
  {
    regex: /\b(transfer your entire (?:bank )?balance|transfer balance|asset seizure list|clear your name|security bond|forensic audit transfer|refundable bond)\b/gi,
    category: 'escrow_coercion',
    categoryLabel: 'Asset Liquidation & Transfer Demand',
    severity: 'CRITICAL',
    weight: 40,
    explanation: 'Coercing the victim to liquidate their savings or mutual funds into an unverified account under pretext of asset protection.',
    counterAdvisory: 'Refuse all money transfers. Contact your personal bank branch manager in person.'
  },

  // 4. Psychological Pressure, Threats & Isolation (HIGH)
  {
    regex: /\b(do not cut the call|don['’]t cut the call|do not disconnect|stay on the line|cannot disconnect)\b/gi,
    category: 'isolation_tactic',
    categoryLabel: 'Coercive Line Retention',
    severity: 'HIGH',
    weight: 30,
    explanation: 'Forcing you to stay on the call prevents you from consulting relatives, lawyers, or banks who would expose the scam.',
    counterAdvisory: 'Hang up without hesitation. Genuine authorities cannot punish you for disconnecting a phone call.'
  },
  {
    regex: /\b(step out of the room|stay in a room|uniform isolation|isolate yourself|do not tell anyone|strictly confidential|keep this secret|national security secret)\b/gi,
    category: 'isolation_tactic',
    categoryLabel: 'Hostage Isolation / Secrecy Demand',
    severity: 'HIGH',
    weight: 35,
    explanation: 'Demanding complete secrecy isolates you psychologically, leaving you vulnerable to escalating extortion demands.',
    counterAdvisory: 'Immediately alert a trusted family member, neighbor, or lawyer. Break the silence immediately.'
  },
  {
    regex: /\b(within (?:15|30) minutes|in (?:15|30) minutes|immediately|frozen right now|blocked immediately|power (?:cut|disconnection) at 9:30|disconnection notice|arrested today)\b/gi,
    category: 'urgency_threat',
    categoryLabel: 'Manufactured Panic & Artificial Deadline',
    severity: 'HIGH',
    weight: 30,
    explanation: 'Artificial deadlines (15/30 minutes) are engineered to prevent rational deliberation and cause knee-jerk compliance.',
    counterAdvisory: 'Take a deep breath and slow down. Legitimate official actions provide statutory notice periods (minimum 7-15 days).'
  },

  // 5. Remote Access Trojans & Malicious APKs (HIGH)
  {
    regex: /\b(download quicksupport|quicksupport|install anydesk|anydesk|teamviewer|rustdesk|screen share|whatsapp link|apk file|download (?:this )?link)\b/gi,
    category: 'malware_apk',
    categoryLabel: 'Remote Control Trojan / APK Request',
    severity: 'CRITICAL',
    weight: 40,
    explanation: 'Remote access software (AnyDesk, QuickSupport) gives the fraudster complete control over your phone screen, keypad, and OTP notifications.',
    counterAdvisory: 'Never install remote desktop apps or download `.apk` packages sent via WhatsApp/SMS.'
  },

  // 6. Customs & Narcotics Parcel Blackmail (HIGH)
  {
    regex: /\b(narcotics|mdma|contraband|customs clearance|parcel seized|fedex parcel|taiwan parcel|illegal passport|airport customs)\b/gi,
    category: 'customs_narcotics',
    categoryLabel: 'Contraband Parcel Blackmail',
    severity: 'HIGH',
    weight: 35,
    explanation: 'Claiming a parcel with drugs/passports in your name is a classic extortion script. Courier companies do not broker criminal allegations.',
    counterAdvisory: 'Courier services and airport customs do not contact citizens over WhatsApp asking for financial settlement.'
  },

  // 7. Video Call Coercion
  {
    regex: /\b(whatsapp video(?: call)?|skype video(?: call)?|turn on your camera|show your face|video investigation)\b/gi,
    category: 'video_coercion',
    categoryLabel: 'Fake Police Station Video Staging',
    severity: 'HIGH',
    weight: 32,
    explanation: 'Scammers use fake police badges, uniforms, and backdrops on Skype/WhatsApp to stage realistic-looking fake police stations.',
    counterAdvisory: 'Courts and police do not conduct investigations on WhatsApp or Skype video calls.'
  }
];

export const PhraseDetectionService = {
  /**
   * Scans a transcript string or streaming text chunk in real-time,
   * extracting all detected manipulative/fraudulent phrases and tokenizing the text for highlight rendering.
   * 
   * @param {string} text The raw text to analyze
   * @returns {Object} Analysis result containing tokenized segments, flagged phrases, severity stats
   */
  analyzeStreamText(text = '') {
    if (!text || typeof text !== 'string') {
      return {
        originalText: '',
        tokenizedSegments: [],
        flaggedPhrases: [],
        stats: {
          totalFlagged: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          highestSeverity: 'SAFE',
          riskScore: 0
        }
      };
    }

    const matches = [];

    // Run regex scans across all pre-compiled patterns
    for (const item of PHRASE_PATTERNS) {
      // Reset regex state for global regexes
      item.regex.lastIndex = 0;
      let match;

      while ((match = item.regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const matchedText = match[0];

        matches.push({
          start,
          end,
          matchedText,
          category: item.category,
          categoryLabel: item.categoryLabel,
          severity: item.severity,
          weight: item.weight,
          explanation: item.explanation,
          counterAdvisory: item.counterAdvisory
        });
      }
    }

    // Sort matches by start position, resolving overlaps by choosing the longest match
    matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

    const nonOverlappingMatches = [];
    let lastEnd = 0;

    for (const m of matches) {
      if (m.start >= lastEnd) {
        nonOverlappingMatches.push(m);
        lastEnd = m.end;
      }
    }

    // Build tokenized segments (alternating plain text and flagged phrases)
    const tokenizedSegments = [];
    let currentIndex = 0;

    for (const match of nonOverlappingMatches) {
      if (match.start > currentIndex) {
        tokenizedSegments.push({
          isFlagged: false,
          text: text.slice(currentIndex, match.start)
        });
      }

      tokenizedSegments.push({
        isFlagged: true,
        text: text.slice(match.start, match.end),
        matchDetails: match
      });

      currentIndex = match.end;
    }

    if (currentIndex < text.length) {
      tokenizedSegments.push({
        isFlagged: false,
        text: text.slice(currentIndex)
      });
    }

    // Aggregate statistics
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let totalRiskContribution = 0;

    const uniquePhrasesMap = new Map();

    for (const m of nonOverlappingMatches) {
      if (m.severity === 'CRITICAL') criticalCount++;
      else if (m.severity === 'HIGH') highCount++;
      else mediumCount++;

      totalRiskContribution += m.weight;

      const key = m.matchedText.toLowerCase();
      if (!uniquePhrasesMap.has(key)) {
        uniquePhrasesMap.set(key, m);
      }
    }

    const uniqueFlaggedPhrases = Array.from(uniquePhrasesMap.values());

    let highestSeverity = 'SAFE';
    if (criticalCount > 0) highestSeverity = 'CRITICAL';
    else if (highCount > 0) highestSeverity = 'HIGH';
    else if (mediumCount > 0) highestSeverity = 'MEDIUM';

    const calculatedRiskScore = Math.min(99, totalRiskContribution);

    return {
      originalText: text,
      tokenizedSegments,
      flaggedPhrases: uniqueFlaggedPhrases,
      stats: {
        totalFlagged: nonOverlappingMatches.length,
        uniqueCount: uniqueFlaggedPhrases.length,
        criticalCount,
        highCount,
        mediumCount,
        highestSeverity,
        riskScore: calculatedRiskScore
      }
    };
  },

  /**
   * Returns accessible styling classes according to phrase severity
   */
  getSeverityTheme(severity) {
    switch (severity) {
      case 'CRITICAL':
        return {
          badgeBg: 'bg-rose-500/25',
          badgeText: 'text-rose-200',
          badgeBorder: 'border-rose-500/60',
          highlightBg: 'bg-rose-950/80 text-rose-100 border border-rose-500/60 shadow-sm shadow-rose-900/40',
          indicatorColor: 'text-rose-400',
          glowRing: 'ring-1 ring-rose-500/50'
        };
      case 'HIGH':
        return {
          badgeBg: 'bg-amber-500/25',
          badgeText: 'text-amber-200',
          badgeBorder: 'border-amber-500/60',
          highlightBg: 'bg-amber-950/80 text-amber-100 border border-amber-500/60 shadow-sm shadow-amber-900/40',
          indicatorColor: 'text-amber-400',
          glowRing: 'ring-1 ring-amber-500/50'
        };
      case 'MEDIUM':
      default:
        return {
          badgeBg: 'bg-yellow-500/20',
          badgeText: 'text-yellow-200',
          badgeBorder: 'border-yellow-500/50',
          highlightBg: 'bg-yellow-950/70 text-yellow-100 border border-yellow-500/50',
          indicatorColor: 'text-yellow-400',
          glowRing: 'ring-1 ring-yellow-500/40'
        };
    }
  },

  /**
   * Evaluates text specifically for attempts to lure the user into surrendering
   * OTPs, PINs, passwords, bank credentials, Aadhaar, PAN, or personal sensitive details.
   * Used for the real-time automatic emergency hang-up and caller blocking kill-switch.
   */
  detectOtpOrPersonalDetailsLure(text = '', speaker = 'caller') {
    if (!text || typeof text !== 'string') {
      return { isLureDetected: false };
    }

    const clean = text.trim();

    // 1. CALLER SOLICITATION PATTERNS (OTP, PIN, Credentials, Personal Details)
    const CALLER_OTP_PATTERNS = [
      {
        regex: /\b(?:tell\s+me|read\s+out|share|give\s+me|send\s+me|enter|provide|verify|forward)\s+(?:the|your)?\s*(?:\d+[- ]?digit\s+)?(?:one[- ]?time\s+password|otp|verification\s+code|security\s+code|sms\s+code|secret\s+code)\b/i,
        triggerType: 'CALLER_OTP_SOLICITATION',
        label: 'OTP / Verification Code Solicitation',
        explanation: 'The caller demanded a secret One-Time Password (OTP) or SMS verification code.'
      },
      {
        regex: /\b(?:tell\s+me|share|give\s+me|enter|provide|read\s+out)\s+(?:your\s+)?(?:upi\s+pin|atm\s+pin|mpin|secret\s+pin|pin\s+number|card\s+pin|login\s+password|netbanking\s+password|cvv(?:\s+number)?)\b/i,
        triggerType: 'CALLER_CREDENTIAL_SOLICITATION',
        label: 'PIN / Banking Password / CVV Demand',
        explanation: 'The caller solicited an authorization PIN, ATM PIN, CVV, or banking password.'
      },
      {
        regex: /\b(?:share\s+your\s+upi\s+pin|enter\s+your\s+secret\s+pin|verify\s+your\s+mpin|tell\s+me\s+the\s+6[- ]?digit|read\s+out\s+the\s+otp)\b/i,
        triggerType: 'CALLER_OTP_SOLICITATION',
        label: 'Direct Banking Credential Theft',
        explanation: 'Explicit request to read out or type private authentication credentials.'
      },
      {
        regex: /\b(?:share|give|tell\s+me|provide|send)\s+(?:your\s+)?(?:aadhaar(?:\s+number|\s+card)?|pan(?:\s+card|\s+number)?|bank\s+account\s+number|account\s+details|personal\s+details|personal\s+information|debit\s+card\s+number|credit\s+card\s+number)\b/i,
        triggerType: 'CALLER_PERSONAL_DETAILS_DEMAND',
        label: 'Personal Identity & Bank Account Demand',
        explanation: 'The caller demanded confidential identification documents (Aadhaar, PAN) or bank account numbers.'
      },
      {
        regex: /\b(?:what\s+is\s+the\s+otp|what\s+is\s+the\s+code|did\s+you\s+receive\s+the\s+otp|open\s+the\s+link\s+and\s+tell\s+me\s+the\s+otp)\b/i,
        triggerType: 'CALLER_OTP_SOLICITATION',
        label: 'SMS / OTP Interception Coercion',
        explanation: 'The caller prompted the victim to reveal an incoming authorization code.'
      }
    ];

    // 2. USER DISCLOSURE PATTERNS (User attempting to state or surrender OTP / details)
    const USER_DISCLOSURE_PATTERNS = [
      {
        regex: /\b(?:my\s+otp\s+is|the\s+otp\s+is|otp\s+is|the\s+code\s+is|code\s+is|here\s+is\s+the\s+code|sure\s+the\s+otp\s+is|take\s+the\s+otp)\b/i,
        triggerType: 'USER_CREDENTIAL_DISCLOSURE',
        label: 'User Yielding One-Time Password (OTP)',
        explanation: 'User started disclosing an authentication OTP code.'
      },
      {
        regex: /\b(?:my\s+pin\s+is|the\s+pin\s+is|my\s+upi\s+pin\s+is|my\s+password\s+is|pin\s+is\s+\d{4,6})\b/i,
        triggerType: 'USER_CREDENTIAL_DISCLOSURE',
        label: 'User Yielding PIN / Secret Password',
        explanation: 'User started disclosing private authorization credentials.'
      },
      {
        regex: /\b(?:my\s+aadhaar(?:\s+number)?\s+is|my\s+pan(?:\s+number)?\s+is|my\s+account\s+number\s+is|here\s+are\s+my\s+details)\b/i,
        triggerType: 'USER_CREDENTIAL_DISCLOSURE',
        label: 'User Surrendering Personal Confidential Details',
        explanation: 'User was lured into sharing identity numbers or financial account details.'
      },
      {
        regex: /\b(?:otp|code|pin)\s+(?:is\s+)?\d{4,8}\b/i,
        triggerType: 'USER_CREDENTIAL_DISCLOSURE',
        label: 'Numeric OTP Code Sequence Detected',
        explanation: 'A 4-to-8 digit one-time passcode sequence was entered.'
      }
    ];

    // Test Caller patterns
    for (const rule of CALLER_OTP_PATTERNS) {
      const match = rule.regex.exec(clean);
      if (match) {
        return {
          isLureDetected: true,
          triggerType: rule.triggerType,
          label: rule.label,
          matchedText: match[0],
          explanation: rule.explanation,
          speaker
        };
      }
    }

    // Test User patterns
    for (const rule of USER_DISCLOSURE_PATTERNS) {
      const match = rule.regex.exec(clean);
      if (match) {
        return {
          isLureDetected: true,
          triggerType: rule.triggerType,
          label: rule.label,
          matchedText: match[0],
          explanation: rule.explanation,
          speaker
        };
      }
    }

    return { isLureDetected: false };
  }
};
