export const INITIAL_CONTACTS = [
  {
    id: 'cnt-1',
    name: 'Aarav Mehta (Brother)',
    phone: '+91 98200 11223',
    email: 'aarav.mehta@gmail.com',
    company: 'Family',
    jobTitle: 'Software Architect',
    category: 'personal',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isFavorite: true,
    callCount: 42,
    notes: 'Personal contact - brother',
    riskRating: 'SAFE',
    reputationScore: 99,
    reportCount: 0,
    tags: ['Family', 'Emergency'],
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'cnt-2',
    name: 'Dr. Ananya Sharma',
    phone: '+91 98111 22334',
    email: 'dr.ananya@cityclinic.org',
    company: 'City Health Care Clinic',
    jobTitle: 'Physician',
    category: 'personal',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    isFavorite: true,
    callCount: 19,
    notes: 'Family doctor for annual checkups',
    riskRating: 'SAFE',
    reputationScore: 98,
    reportCount: 0,
    tags: ['Medical', 'Doctor'],
    createdAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'cnt-3',
    name: 'Priya Iyer',
    phone: '+91 98765 43210',
    email: 'priya.iyer@fintech.io',
    company: 'FinTech Innovations',
    jobTitle: 'Product Manager',
    category: 'work',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isFavorite: false,
    callCount: 8,
    notes: 'Work colleague from design sprints',
    riskRating: 'SAFE',
    reputationScore: 95,
    reportCount: 0,
    tags: ['Work', 'Projects'],
    createdAt: '2026-03-01T09:15:00.000Z'
  },
  {
    id: 'cnt-4',
    name: 'National Cyber Helpline 1930',
    phone: '1930',
    email: 'complaint@cybercrime.gov.in',
    company: 'Ministry of Home Affairs (I4C)',
    jobTitle: 'National Cybercrime Reporting Portal',
    category: 'emergency',
    avatarUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=150&auto=format&fit=crop&q=80',
    isFavorite: true,
    callCount: 26,
    notes: 'Official 24/7 Financial Fraud Reporting Helpline',
    riskRating: 'SAFE',
    reputationScore: 100,
    reportCount: 0,
    tags: ['Government', 'Helpline', 'Verified'],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cnt-5',
    name: 'Police Emergency 112',
    phone: '112',
    email: 'emergency@police.gov.in',
    company: 'Emergency Response Support System (ERSS)',
    jobTitle: 'National Emergency Service',
    category: 'emergency',
    avatarUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=150&auto=format&fit=crop&q=80',
    isFavorite: true,
    callCount: 14,
    notes: 'All-in-one national emergency number (Police, Fire, Ambulance)',
    riskRating: 'SAFE',
    reputationScore: 100,
    reportCount: 0,
    tags: ['Emergency', 'Police', 'Verified'],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cnt-6',
    name: 'Inspector Vijay Chauhan (Suspected)',
    phone: '+91 98201 54321',
    company: 'Claimed "Mumbai Cyber Cell"',
    jobTitle: 'Unknown Caller',
    category: 'suspicious',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isFavorite: false,
    callCount: 35,
    notes: 'Reported 142 times for Digital Arrest extortion scam impersonating Mumbai Police',
    riskRating: 'REPORTED_FRAUD',
    reputationScore: 8,
    reportCount: 142,
    tags: ['Scam Alert', 'Digital Arrest', 'Impersonator'],
    createdAt: '2026-04-12T11:20:00.000Z'
  },
  {
    id: 'cnt-7',
    name: 'FedEx Customs Hub (Fake)',
    phone: '+91 77382 11094',
    company: 'Claimed "Customs Clearance Mumbai"',
    jobTitle: 'Spam Auto-Dialer',
    category: 'suspicious',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isFavorite: false,
    callCount: 21,
    notes: 'Reported 89 times for parcel contraband threat scam',
    riskRating: 'REPORTED_FRAUD',
    reputationScore: 12,
    reportCount: 89,
    tags: ['Scam Alert', 'Courier Fraud'],
    createdAt: '2026-04-15T16:45:00.000Z'
  }
];

/**
 * Parses vCard (.vcf) format text into Contact objects
 */
export function parseVCF(vcfContent) {
  const contacts = [];
  const cards = (vcfContent || '').split(/BEGIN:VCARD/i).filter(c => c.trim().length > 0);

  for (const card of cards) {
    let name = '';
    let phone = '';
    let email = '';
    let company = '';
    let jobTitle = '';
    let notes = '';

    const lines = card.split(/\r\n|\r|\n/);
    for (const line of lines) {
      if (line.toUpperCase().startsWith('FN:')) {
        name = line.substring(3).trim();
      } else if (!name && line.toUpperCase().startsWith('N:')) {
        const parts = line.substring(2).split(';').filter(Boolean);
        name = parts.reverse().join(' ').trim();
      } else if (line.toUpperCase().includes('TEL')) {
        const val = line.split(':')[1];
        if (val && !phone) phone = val.trim();
      } else if (line.toUpperCase().includes('EMAIL')) {
        const val = line.split(':')[1];
        if (val && !email) email = val.trim();
      } else if (line.toUpperCase().startsWith('ORG:')) {
        company = line.substring(4).split(';')[0].trim();
      } else if (line.toUpperCase().startsWith('TITLE:')) {
        jobTitle = line.substring(6).trim();
      } else if (line.toUpperCase().startsWith('NOTE:')) {
        notes = line.substring(5).trim();
      }
    }

    if (name || phone) {
      contacts.push({
        id: 'imported-' + Math.random().toString(36).substring(2, 9),
        name: name || 'Unnamed Contact',
        phone: phone || '+91 00000 00000',
        email: email || undefined,
        company: company || undefined,
        jobTitle: jobTitle || undefined,
        category: 'personal',
        isFavorite: false,
        notes: notes || 'Imported via vCard (.vcf)',
        riskRating: 'UNKNOWN',
        reputationScore: 75,
        reportCount: 0,
        tags: ['Imported', 'vCard'],
        createdAt: new Date().toISOString()
      });
    }
  }

  return contacts;
}

/**
 * Parses CSV format text into Contact objects
 */
export function parseCSV(csvContent) {
  const contacts = [];
  const lines = (csvContent || '').split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return contacts;

  // Header detection
  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const nameIdx = header.findIndex(h => h.includes('name') || h === 'fn' || h === 'full_name');
  const phoneIdx = header.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel') || h.includes('number'));
  const emailIdx = header.findIndex(h => h.includes('email') || h.includes('mail'));
  const compIdx = header.findIndex(h => h.includes('company') || h.includes('org'));
  const noteIdx = header.findIndex(h => h.includes('note') || h.includes('desc'));

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (rawCols.length < 1 || !rawCols.some(Boolean)) continue;

    const name = nameIdx >= 0 && rawCols[nameIdx] ? rawCols[nameIdx] : rawCols[0];
    const phone = phoneIdx >= 0 && rawCols[phoneIdx] ? rawCols[phoneIdx] : (rawCols[1] || '+91 99999 00000');
    const email = emailIdx >= 0 ? rawCols[emailIdx] : undefined;
    const company = compIdx >= 0 ? rawCols[compIdx] : undefined;
    const notes = noteIdx >= 0 ? rawCols[noteIdx] : undefined;

    if (name || phone) {
      contacts.push({
        id: 'imported-csv-' + Math.random().toString(36).substring(2, 9),
        name: name || 'CSV Contact',
        phone: phone || '+91 00000 00000',
        email: email || undefined,
        company: company || undefined,
        category: 'personal',
        isFavorite: false,
        notes: notes || 'Imported via CSV',
        riskRating: 'UNKNOWN',
        reputationScore: 70,
        reportCount: 0,
        tags: ['Imported', 'CSV'],
        createdAt: new Date().toISOString()
      });
    }
  }

  return contacts;
}

/**
 * Generates sample vCard data for testing import
 */
export function getSampleVCardData() {
  return `BEGIN:VCARD
VERSION:3.0
FN:Rajesh Verma (Lawyer)
N:Verma;Rajesh;;;
TEL;TYPE=CELL:+91 98334 55667
EMAIL:rajesh.verma@advocates.org
ORG:Verma & Associates Legal Counsel
TITLE:High Court Advocate
NOTE:Verified Legal Advisor for Cyber Fraud Consultation
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:ICICI Bank Customer Desk
N:Bank;ICICI;Customer;Desk;
TEL;TYPE=WORK:1800 1080
EMAIL:care@icicibank.com
ORG:ICICI Bank Limited
TITLE:24x7 Verified Banking Support
NOTE:Official toll-free banking contact
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Unknown Suspect (Courier Threat)
N:Suspect;Unknown;;;
TEL;TYPE=CELL:+91 79901 88231
ORG:Claimed Customs Clearance
TITLE:Suspicious Auto-dialer
NOTE:Reported 56 times for DHL customs parcel scam
END:VCARD`;
}

/**
 * Generates sample CSV data for testing import
 */
export function getSampleCSVData() {
  return `name,phone,email,company,notes
"Sneha Kulkarni","+91 97654 32190","sneha.k@techcorp.com","TechCorp Labs","Product Designer"
"CBI Official Helpdesk","+91 11 2436 2755","contact@cbi.gov.in","Central Bureau of Investigation","Official Anti-Corruption Branch verified number"
"Lottery Claim Officer (Fake)","+91 91234 56789","winner@claim-prizes.xyz","Suspicious Prize Desk","Reported 88 times for KBC Lottery Scam"`;
}
