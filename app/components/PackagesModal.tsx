'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const HEADERS: HeadersInit = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};



const COUNTRY_OPTIONS = [
  { name: "Afghanistan", flag: "🇦🇫", code: "+93" },
  { name: "Albania", flag: "🇦🇱", code: "+355" },
  { name: "Algeria", flag: "🇩🇿", code: "+213" },
  { name: "Angola", flag: "🇦🇴", code: "+244" },
  { name: "Argentina", flag: "🇦🇷", code: "+54" },
  { name: "Armenia", flag: "🇦🇲", code: "+374" },
  { name: "Australia", flag: "🇦🇺", code: "+61" },
  { name: "Austria", flag: "🇦🇹", code: "+43" },
  { name: "Azerbaijan", flag: "🇦🇿", code: "+994" },
  { name: "Bangladesh", flag: "🇧🇩", code: "+880" },
  { name: "Belgium", flag: "🇧🇪", code: "+32" },
  { name: "Benin", flag: "🇧🇯", code: "+229" },
  { name: "Bhutan", flag: "🇧🇹", code: "+975" },
  { name: "Botswana", flag: "🇧🇼", code: "+267" },
  { name: "Brazil", flag: "🇧🇷", code: "+55" },
  { name: "Brunei", flag: "🇧🇳", code: "+673" },
  { name: "Bulgaria", flag: "🇧🇬", code: "+359" },
  { name: "Burkina Faso", flag: "🇧🇫", code: "+226" },
  { name: "Burundi", flag: "🇧🇮", code: "+257" },
  { name: "Cambodia", flag: "🇰🇭", code: "+855" },
  { name: "Cameroon", flag: "🇨🇲", code: "+237" },
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "Cape Verde", flag: "🇨🇻", code: "+238" },
  { name: "Central African Republic", flag: "🇨🇫", code: "+236" },
  { name: "Chad", flag: "🇹🇩", code: "+235" },
  { name: "Chile", flag: "🇨🇱", code: "+56" },
  { name: "China", flag: "🇨🇳", code: "+86" },
  { name: "Colombia", flag: "🇨🇴", code: "+57" },
  { name: "Comoros", flag: "🇰🇲", code: "+269" },
  { name: "Congo", flag: "🇨🇬", code: "+242" },
  { name: "Congo (DRC)", flag: "🇨🇩", code: "+243" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", code: "+225" },
  { name: "Croatia", flag: "🇭🇷", code: "+385" },
  { name: "Cyprus", flag: "🇨🇾", code: "+357" },
  { name: "Czechia", flag: "🇨🇿", code: "+420" },
  { name: "Denmark", flag: "🇩🇰", code: "+45" },
  { name: "Djibouti", flag: "🇩🇯", code: "+253" },
  { name: "Egypt", flag: "🇪🇬", code: "+20" },
  { name: "Equatorial Guinea", flag: "🇬🇶", code: "+240" },
  { name: "Eritrea", flag: "🇪🇷", code: "+291" },
  { name: "Estonia", flag: "🇪🇪", code: "+372" },
  { name: "Eswatini", flag: "🇸🇿", code: "+268" },
  { name: "Ethiopia", flag: "🇪🇹", code: "+251" },
  { name: "Fiji", flag: "🇫🇯", code: "+679" },
  { name: "Finland", flag: "🇫🇮", code: "+358" },
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Gabon", flag: "🇬🇦", code: "+241" },
  { name: "Gambia", flag: "🇬🇲", code: "+220" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "Ghana", flag: "🇬🇭", code: "+233" },
  { name: "Greece", flag: "🇬🇷", code: "+30" },
  { name: "Guinea", flag: "🇬🇳", code: "+224" },
  { name: "Guinea-Bissau", flag: "🇬🇼", code: "+245" },
  { name: "Hungary", flag: "🇭🇺", code: "+36" },
  { name: "Iceland", flag: "🇮🇸", code: "+354" },
  { name: "India", flag: "🇮🇳", code: "+91" },
  { name: "Indonesia", flag: "🇮🇩", code: "+62" },
  { name: "Iran", flag: "🇮🇷", code: "+98" },
  { name: "Iraq", flag: "🇮🇶", code: "+964" },
  { name: "Ireland", flag: "🇮🇪", code: "+353" },
  { name: "Israel", flag: "🇮🇱", code: "+972" },
  { name: "Italy", flag: "🇮🇹", code: "+39" },
  { name: "Japan", flag: "🇯🇵", code: "+81" },
  { name: "Jordan", flag: "🇯🇴", code: "+962" },
  { name: "Kazakhstan", flag: "🇰🇿", code: "+7" },
  { name: "Kenya", flag: "🇰🇪", code: "+254" },
  { name: "Kuwait", flag: "🇰🇼", code: "+965" },
  { name: "Kyrgyzstan", flag: "🇰🇬", code: "+996" },
  { name: "Laos", flag: "🇱🇦", code: "+856" },
  { name: "Latvia", flag: "🇱🇻", code: "+371" },
  { name: "Lebanon", flag: "🇱🇧", code: "+961" },
  { name: "Lesotho", flag: "🇱🇸", code: "+266" },
  { name: "Liberia", flag: "🇱🇷", code: "+231" },
  { name: "Libya", flag: "🇱🇾", code: "+218" },
  { name: "Lithuania", flag: "🇱🇹", code: "+370" },
  { name: "Luxembourg", flag: "🇱🇺", code: "+352" },
  { name: "Madagascar", flag: "🇲🇬", code: "+261" },
  { name: "Malawi", flag: "🇲🇼", code: "+265" },
  { name: "Malaysia", flag: "🇲🇾", code: "+60" },
  { name: "Maldives", flag: "🇲🇻", code: "+960" },
  { name: "Mali", flag: "🇲🇱", code: "+223" },
  { name: "Malta", flag: "🇲🇹", code: "+356" },
  { name: "Mauritania", flag: "🇲🇷", code: "+222" },
  { name: "Mauritius", flag: "🇲🇺", code: "+230" },
  { name: "Mexico", flag: "🇲🇽", code: "+52" },
  { name: "Moldova", flag: "🇲🇩", code: "+373" },
  { name: "Monaco", flag: "🇲🇨", code: "+377" },
  { name: "Mongolia", flag: "🇲🇳", code: "+976" },
  { name: "Montenegro", flag: "🇲🇪", code: "+382" },
  { name: "Morocco", flag: "🇲🇦", code: "+212" },
  { name: "Mozambique", flag: "🇲🇿", code: "+258" },
  { name: "Namibia", flag: "🇳🇦", code: "+264" },
  { name: "Nepal", flag: "🇳🇵", code: "+977" },
  { name: "Netherlands", flag: "🇳🇱", code: "+31" },
  { name: "New Zealand", flag: "🇳🇿", code: "+64" },
  { name: "Niger", flag: "🇳🇪", code: "+227" },
  { name: "Nigeria", flag: "🇳🇬", code: "+234" },
  { name: "Norway", flag: "🇳🇴", code: "+47" },
  { name: "Oman", flag: "🇴🇲", code: "+968" },
  { name: "Pakistan", flag: "🇵🇰", code: "+92" },
  { name: "Peru", flag: "🇵🇪", code: "+51" },
  { name: "Philippines", flag: "🇵🇭", code: "+63" },
  { name: "Poland", flag: "🇵🇱", code: "+48" },
  { name: "Portugal", flag: "🇵🇹", code: "+351" },
  { name: "Qatar", flag: "🇶🇦", code: "+974" },
  { name: "Romania", flag: "🇷🇴", code: "+40" },
  { name: "Russia", flag: "🇷🇺", code: "+7" },
  { name: "Rwanda", flag: "🇷🇼", code: "+250" },
  { name: "Samoa", flag: "🇼🇸", code: "+685" },
  { name: "Sao Tome & Principe", flag: "🇸🇹", code: "+239" },
  { name: "Saudi Arabia", flag: "🇸🇦", code: "+966" },
  { name: "Senegal", flag: "🇸🇳", code: "+221" },
  { name: "Serbia", flag: "🇷🇸", code: "+381" },
  { name: "Seychelles", flag: "🇸🇨", code: "+248" },
  { name: "Sierra Leone", flag: "🇸🇱", code: "+232" },
  { name: "Singapore", flag: "🇸🇬", code: "+65" },
  { name: "Slovakia", flag: "🇸🇰", code: "+421" },
  { name: "Slovenia", flag: "🇸🇮", code: "+386" },
  { name: "Somalia", flag: "🇸🇴", code: "+252" },
  { name: "South Africa", flag: "🇿🇦", code: "+27" },
  { name: "South Korea", flag: "🇰🇷", code: "+82" },
  { name: "South Sudan", flag: "🇸🇸", code: "+211" },
  { name: "Spain", flag: "🇪🇸", code: "+34" },
  { name: "Sri Lanka", flag: "🇱🇰", code: "+94" },
  { name: "Sudan", flag: "🇸🇩", code: "+249" },
  { name: "Sweden", flag: "🇸🇪", code: "+46" },
  { name: "Switzerland", flag: "🇨🇭", code: "+41" },
  { name: "Taiwan", flag: "🇹🇼", code: "+886" },
  { name: "Tanzania", flag: "🇹🇿", code: "+255" },
  { name: "Thailand", flag: "🇹🇭", code: "+66" },
  { name: "Tonga", flag: "🇹🇴", code: "+676" },
  { name: "Tunisia", flag: "🇹🇳", code: "+216" },
  { name: "Turkey", flag: "🇹🇷", code: "+90" },
  { name: "Uganda", flag: "🇺🇬", code: "+256" },
  { name: "Ukraine", flag: "🇺🇦", code: "+380" },
  { name: "United Arab Emirates", flag: "🇦🇪", code: "+971" },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44" },
  { name: "United States", flag: "🇺🇸", code: "+1" },
  { name: "Uzbekistan", flag: "🇺🇿", code: "+998" },
  { name: "Venezuela", flag: "🇻🇪", code: "+58" },
  { name: "Vietnam", flag: "🇻🇳", code: "+84" },
  { name: "Zambia", flag: "🇿🇲", code: "+260" },
  { name: "Zimbabwe", flag: "🇿🇼", code: "+263" },
];

type PackageRow = {
  id: number;
  code: string | null;
  name: string | null;
  description?: string | null;
  package_price: number | null;
  currency: string | null;
  nights: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  image_url?: string | null;
};

type RoomRow = {
  id: number;
  code: string | null;
  name: string | null;
  image_url?: string | null;
  max_adults?: number | null;
};


type ExtraRow = {
  id: number;
  name: string | null;
  price: number | null;
  currency: string | null;
  code: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialPackageId?: number | null;
};

function formatDateDDMMMYYYY(isoDate?: string | null): string {
  if (!isoDate) return '';

  const s = isoDate.slice(0, 10); // YYYY-MM-DD
  const parts = s.split('-');
  if (parts.length !== 3) return '';

  const [yyyy, mm, dd] = parts;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mIdx = Number(mm) - 1;

  if (!yyyy || !dd || isNaN(mIdx) || mIdx < 0 || mIdx > 11) return '';

  return `${dd}-${months[mIdx]}-${yyyy}`;
}


function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return n.toLocaleString('en-US');
}


function addDaysISO(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00'); // force LOCAL midnight
  if (isNaN(d.getTime())) return toLocalISO(new Date());
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
}


function toLocalISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


function rangesOverlap(
  aStart: string | null,
  aEnd: string | null,
  bStart: string,
  bEnd: string
): boolean {
  if (!aStart || !aEnd) return false;
  const A = new Date(aStart);
  const B = new Date(aEnd);
  const C = new Date(bStart);
  const D = new Date(bEnd);
  if (
    Number.isNaN(A.getTime()) ||
    Number.isNaN(B.getTime()) ||
    Number.isNaN(C.getTime()) ||
    Number.isNaN(D.getTime())
  ) {
    return false;
  }
  // overlap if existingStart < newEnd AND existingEnd > newStart
  return A < D && B > C;
}


function diffNights(ci: string, co: string): number {
  const start = new Date(ci);
  const end = new Date(co);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}

async function postJSON<T>(table: string, payload: any | any[]): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Insert failed (${res.status})`);
  }
  return res.json();
}

export default function PackagesModal({ isOpen, onClose, initialPackageId }: Props) {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [stage, setStage] = useState<'packages' | 'dates' | 'rooms' | 'details'>(
    'packages'
  );
  const [roomsByPackage, setRoomsByPackage] = useState<Record<number, RoomRow[]>>(
    {}
  );

  const [nextAvailableByPackage, setNextAvailableByPackage] = useState<
  Record<number, string | null>
  >({});

  const [extrasByPackage, setExtrasByPackage] = useState<
    Record<
      number,
      {
        extra_id: number;
        quantity: number;
        code: string | null;
        name: string | null;
        price: number;
        currency: string;
      }[]
    >
  >({});
  const [filteredPackages, setFilteredPackages] = useState<PackageRow[]>([]);
  const [availableRoomsByPackage, setAvailableRoomsByPackage] = useState<
    Record<number, RoomRow[]>
  >({});
  const [availableRoomsForSelected, setAvailableRoomsForSelected] = useState<
    RoomRow[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState<{
  code: string;
  guestName: string;
  roomName: string;
  total: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  packageName: string;
  packageIncludes?: string | null;
  // NEW fields to match setConfirmation payload
  packageExtras?: any[];
  packageNights: number;
} | null>(null);


  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const todayISO = useMemo(() => toLocalISO(new Date()), []);


  const [checkIn, setCheckIn] = useState<string>(todayISO);
  const [checkOut, setCheckOut] = useState<string>(addDaysISO(todayISO, 1));

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+233');
  const [ccOpen, setCcOpen] = useState(false);
  const [ccSearch, setCcSearch] = useState('');
  const ccRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState(2);
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showExperiencesModal, setShowExperiencesModal] = useState(false);
  const [currentExperienceSlide, setCurrentExperienceSlide] = useState(0);
  // Custom date picker state
  const [activePickerId, setActivePickerId] = useState<'ci' | 'co' | null>(null);
  const [currentPickerMonth, setCurrentPickerMonth] = useState(() => {
    const now = new Date();
    return {
      ci: new Date(now.getFullYear(), now.getMonth(), 1),
      co: new Date(now.getFullYear(), now.getMonth(), 1)
    };
  });
  
  // CRITICAL: Dual storage for disabled dates (useState + useRef) - EXACT pattern from BookingWidget
  const [disabledDates, setDisabledDates] = useState<string[]>([]);
  const disabledDatesRef = useRef<string[]>([]);

  const [invalidCheckoutDates, setInvalidCheckoutDates] = useState<string[]>([]);
  const invalidCheckoutDatesRef = useRef<string[]>([]);
  
  const experiencesData = [
    {
      image: 'https://res.cloudinary.com/dzldvlbwb/image/upload/v1733055931/anomabu_beach_3_vxgtw3.jpg',
      title: 'Beach Bliss',
      description: 'Immerse yourself in the serene beauty of our pristine beach. Feel the soft sand beneath your feet, listen to the gentle waves, and watch breathtaking sunsets paint the sky.'
    },
    {
      image: 'https://res.cloudinary.com/dzldvlbwb/image/upload/v1733055941/elmina_castle_3_fmlgrb.jpg',
      title: 'Historical Tours',
      description: 'Journey through centuries of history at the UNESCO World Heritage Sites of Elmina and Cape Coast Castles. Explore the rich cultural heritage and powerful stories of the region.'
    },
    {
      image: 'https://res.cloudinary.com/dzldvlbwb/image/upload/v1733055952/anomabu_fishing_s6hcby.jpg',
      title: 'Local Culture',
      description: 'Experience the vibrant local fishing community, colorful boats, and authentic coastal life. Engage with friendly locals and discover the traditions that define this beautiful region.'
    },
    {
      image: 'https://res.cloudinary.com/dzldvlbwb/image/upload/v1733055944/swimming_lkdnzm.jpg',
      title: 'Water Activities',
      description: 'Dive into adventure with swimming, snorkeling, and water sports. Our location offers perfect conditions for both relaxation and exciting aquatic experiences.'
    }
  ];

  const selectedPkg = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  const roomsForSelected = useMemo(
    () => (selectedPackageId ? roomsByPackage[selectedPackageId] ?? [] : []),
    [selectedPackageId, roomsByPackage]
  );

  const selectedRoom = useMemo(
    () => roomsForSelected.find((r) => r.id === selectedRoomId) ?? null,
    [roomsForSelected, selectedRoomId]
  );

  const total = useMemo(() => selectedPkg?.package_price ?? 0, [selectedPkg]);

  const extrasForSelectedPackage = useMemo(
  () => (selectedPackageId ? extrasByPackage[selectedPackageId] ?? [] : []),
  [selectedPackageId, extrasByPackage]
);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ccRef.current && !ccRef.current.contains(e.target as Node)) {
        setCcOpen(false);
        setCcSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: get selected country object
  const selectedCountry = COUNTRY_OPTIONS.find(c => c.code === countryCode) || COUNTRY_OPTIONS.find(c => c.name === 'Ghana')!;

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    if (!ccSearch) return COUNTRY_OPTIONS;
    const q = ccSearch.toLowerCase();
    return COUNTRY_OPTIONS.filter(c => c.name.toLowerCase().includes(q) || c.code.includes(q));
  }, [ccSearch]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialPackageId) setSelectedPackageId(initialPackageId);

        async function init() {
      setLoading(true);
      setError(null);
      try {
        // 1) Load packages
        const pkgURL =
          `${SUPABASE_URL}/rest/v1/packages` +
          `?select=id,code,name,description,package_price,currency,nights,valid_from,valid_until,image_url` +
          `&is_active=eq.true&order=sort_order`;
        const pkgsRaw = await fetchJSON<any>(pkgURL);
        const pkgs: PackageRow[] = Array.isArray(pkgsRaw) ? pkgsRaw : [];

        setPackages(pkgs);

        if (pkgs.length === 0) {
          setError('No packages available currently.');
          setLoading(false);
          return;
        }

        // Build safe in() list for numeric or UUID ids
        const pkgIds = pkgs.map((p) => p.id);
        const pkgIdList = pkgIds
          .map((id) => {
            const s = String(id);
            return /^\d+$/.test(s) ? s : `"${s}"`;
          })
          .join(',');

        // 2) Load package → room mappings
        const roomsURL =
          `${SUPABASE_URL}/rest/v1/packages_rooms` +
          `?select=package_id,room_type_id&package_id=in.(${pkgIdList})`;
        const pkgRooms = await fetchJSON<
          { package_id: number; room_type_id: number }[]
        >(roomsURL);

        const roomIdSet = new Set<number>();
        const roomIdsByPkg: Record<number, number[]> = {};
          
        const normalizeCode = (s: string) => (s || '').trim().toUpperCase();
        const roomIdByCode: Record<string, number> = {};

        pkgRooms.forEach((pr) => {
          if (pr.room_type_id == null) return;
          roomIdSet.add(pr.room_type_id);
          if (!roomIdsByPkg[pr.package_id]) roomIdsByPkg[pr.package_id] = [];
          roomIdsByPkg[pr.package_id].push(pr.room_type_id);
        });

        if (roomIdSet.size > 0) {
          const roomTypesURL =
            `${SUPABASE_URL}/rest/v1/room_types` +
            `?select=id,code,name,image_url,max_adults` +
            `&id=in.(${Array.from(roomIdSet).join(',')})`;
          const allRooms = await fetchJSON<RoomRow[]>(roomTypesURL);

          const roomMap: Record<number, RoomRow> = {};
          allRooms.forEach((rm) => {
            roomMap[rm.id] = rm;
          });

          // code -> id map (for reservations that store room_type_code instead of room_type_id)
          allRooms.forEach((rm) => {
            if (rm.code) roomIdByCode[normalizeCode(rm.code)] = rm.id;
          });


          const rByPkg: Record<number, RoomRow[]> = {};
          Object.entries(roomIdsByPkg).forEach(([pkgIdStr, roomIdArr]) => {
            const arr = Array.isArray(roomIdArr) ? roomIdArr : [];
            // Keep the original key (works for numeric ids and UUIDs); cast is TS-only
            const key = pkgIdStr as unknown as number;
            rByPkg[key] = arr
              .map((rId) => roomMap[rId])
              .filter(Boolean);
          });

          setRoomsByPackage(rByPkg);

          
        } else {
          setRoomsByPackage({});
        }

        // Store roomMap for availability calculation
        const roomDataMap: Record<number, RoomRow> = {};
        if (roomIdSet.size > 0) {
          const roomTypesURL =
            `${SUPABASE_URL}/rest/v1/room_types` +
            `?select=id,code,name,image_url,max_adults` +
            `&id=in.(${Array.from(roomIdSet).join(',')})`;
          const roomsData = await fetchJSON<RoomRow[]>(roomTypesURL);
          roomsData.forEach((rm) => {
            roomDataMap[rm.id] = rm;
          });
        }

        // ---- Compute "Available from" date per package (MATCH calendar availability logic) ----
        const todayISO = toLocalISO(new Date());

        // Build occupancy sets for ALL rooms referenced by packages
        const occupancyByRoom: Record<number, Set<string>> = {};
        Array.from(roomIdSet).forEach((rid) => {
          occupancyByRoom[rid] = new Set<string>();
        });

        const horizonDays = 365;
        const horizonEndISO = addDaysISO(todayISO, horizonDays);
                let resvs: {
          room_type_id: number | string | null;
          room_type_code: string | null;
          check_in: string | null;
          check_out: string | null;
          status: string | null;
        }[] = [];

        let blocked: { room_type_id: number | string | null; blocked_date: string | null }[] = [];

        // 1) Reservations overlapping horizon for these rooms
        if (roomIdSet.size) {
          const roomIds = Array.from(roomIdSet);

          const resUrl =
            `${SUPABASE_URL}/rest/v1/reservations` +
            `?select=room_type_id,room_type_code,check_in,check_out,status` +
            `&check_in=lt.${horizonEndISO}&check_out=gt.${todayISO}` +
            `&status=not.in.("cancelled","no_show")`;


          resvs = await fetchJSON<

            {
              room_type_id: number | string | null;
              room_type_code: string | null;
              check_in: string | null;
              check_out: string | null;
              status: string | null;
            }[]
          >(resUrl);


                    (resvs || []).forEach((r) => {
            if (!r.check_in || !r.check_out) return;

            let rid: number | null = null;

            // 1) try room_type_id (number or numeric string)
            if (r.room_type_id != null) {
              const n = Number(r.room_type_id);
              if (!Number.isNaN(n)) rid = n;
            }

            // 2) fallback to room_type_code
            if (rid == null && r.room_type_code) {
              rid = roomIdByCode[normalizeCode(r.room_type_code)] ?? null;
            }

            // only stamp occupancy for rooms used by these packages
            if (rid == null || !roomIdSet.has(rid)) return;

            const set = occupancyByRoom[rid];
            if (!set) return;

            let cur = new Date(r.check_in.slice(0, 10) + 'T00:00:00');
            const end = new Date(r.check_out.slice(0, 10) + 'T00:00:00');
            if (isNaN(cur.getTime()) || isNaN(end.getTime())) return;

            while (cur < end) {
              set.add(toLocalISO(cur));
              cur.setDate(cur.getDate() + 1);
            }
          });

        }

        // 2) Blocked dates for these rooms (this is what your calendar uses too)
        if (roomIdSet.size) {
          const roomIds = Array.from(roomIdSet);
          const blockedUrl =
            `${SUPABASE_URL}/rest/v1/blocked_dates` +
            `?select=room_type_id,blocked_date` +
            `&room_type_id=in.(${roomIds.join(',')})` +
            `&blocked_date=gte.${todayISO}&blocked_date=lt.${horizonEndISO}`;

          blocked = await fetchJSON<
            { room_type_id: number | string | null; blocked_date: string | null }[]
          >(blockedUrl);

          (blocked || []).forEach((b) => {
            if (!b.room_type_id || !b.blocked_date) return;
            const rid = Number(b.room_type_id);
            if (Number.isNaN(rid)) return;
            const set = occupancyByRoom[rid];
            if (!set) return;
            set.add(b.blocked_date.slice(0, 10));
          });
        }


        // ---- Compute "Available from" using CORRECT calendar logic ----
        const nextAvailMap: Record<number, string | null> = {};

        pkgs.forEach((pkg) => {
          const nights = pkg.nights ?? 1;
          const roomIdsForPkg = roomIdsByPkg[pkg.id] || [];
          let nextAvailable: string | null = null;

          if (!roomIdsForPkg.length) {
            nextAvailMap[pkg.id] = null;
            return;
          }

          // Build lookup maps for rooms in this package (CORRECT logic lines 687-696)
          const roomKeyById: Record<string, string> = {};
          const roomKeyByCode: Record<string, string> = {};
          const occupancy: Record<string, Set<string>> = {};

          // Get room details for this package
          const rooms = roomIdsForPkg
            .map((id) => roomDataMap[id])
            .filter(Boolean);

          rooms.forEach((room: any) => {
            const key = String(room.id);
            occupancy[key] = new Set<string>();
            roomKeyById[String(room.id)] = key;
            if (room.code) roomKeyByCode[room.code] = key;
          });

          // Fetch reservations and blocked dates (CORRECT logic lines 708-771)
          const horizonStartISO = todayISO;
          const horizonEndISO = addDaysISO(todayISO, horizonDays);

          // Add reservations to occupancy
          (resvs || []).forEach((r) => {
            if (!r.check_in || !r.check_out) return;

            const idKey = r.room_type_id ? roomKeyById[String(r.room_type_id)] : undefined;
            const codeKey = r.room_type_code ? roomKeyByCode[r.room_type_code] : undefined;

            const key = idKey ?? codeKey;
            if (!key) return;

            let cur = new Date(r.check_in + 'T00:00:00');
            const end = new Date(r.check_out + 'T00:00:00');
            if (isNaN(cur.getTime()) || isNaN(end.getTime())) return;

            const set = occupancy[key];
            if (!set) return;

            while (cur < end) {
              set.add(toLocalISO(cur));
              cur.setDate(cur.getDate() + 1);
            }
          });

          // Add blocked dates to occupancy
          (blocked || []).forEach((b) => {
            const key = roomKeyById[String(b.room_type_id)];
            if (!key || !b.blocked_date) return;
            occupancy[key]?.add(String(b.blocked_date).slice(0, 10));
          });

          // Find first available date (CORRECT logic lines 775-834)
          const startFrom = pkg.valid_from && pkg.valid_from > todayISO ? pkg.valid_from : todayISO;
          const ciCursor = new Date(startFrom + 'T00:00:00');
          const horizonEnd = new Date(todayISO + 'T00:00:00');
          horizonEnd.setFullYear(horizonEnd.getFullYear() + 1);

          while (ciCursor <= horizonEnd) {
            const ciStr = toLocalISO(ciCursor);

            // Enforce package validity on check-in
            if (pkg.valid_from && ciStr < pkg.valid_from) {
              ciCursor.setDate(ciCursor.getDate() + 1);
              continue;
            }

            const coStr = addDaysISO(ciStr, nights);

            // Ensure checkout doesn't exceed valid_until
            if (pkg.valid_until && coStr > pkg.valid_until) {
              break;
            }

            let hasAvailableRoom = false;

            for (const room of rooms) {
              const key = String(room.id);
              const occ = occupancy[key] ?? new Set<string>();
              let roomFree = true;

              for (let i = 0; i < nights; i++) {
                const d = new Date(ciCursor);
                d.setDate(d.getDate() + i);
                const dStr = toLocalISO(d);
                if (occ.has(dStr)) {
                  roomFree = false;
                  break;
                }
              }

              if (roomFree) {
                hasAvailableRoom = true;
                break;
              }
            }

            if (hasAvailableRoom) {
              nextAvailable = ciStr;
              break;
            }

            ciCursor.setDate(ciCursor.getDate() + 1);
          }

          nextAvailMap[pkg.id] = nextAvailable;
        });

        setNextAvailableByPackage(nextAvailMap);



        // 3) Load package extras (NOTE: table name is package_extras)
        const extrasURL =
          `${SUPABASE_URL}/rest/v1/package_extras` +
          `?select=package_id,extra_id,quantity&package_id=in.(${pkgIdList})`;
        const pkgExtras = await fetchJSON<
          { package_id: number; extra_id: number; quantity: number }[]
        >(extrasURL);

        const extraIdSet = new Set<number>();
        pkgExtras.forEach((pe) => extraIdSet.add(pe.extra_id));

        if (extraIdSet.size > 0) {
          const extrasDataURL =
            `${SUPABASE_URL}/rest/v1/extras` +
            `?select=id,code,name,price,currency` +
            `&id=in.(${Array.from(extraIdSet).join(',')})`;
          const extrasData = await fetchJSON<ExtraRow[]>(extrasDataURL);

          const extraMap: Record<number, ExtraRow> = {};
          extrasData.forEach((ex) => {
            extraMap[ex.id] = ex;
          });

          const eByPkg: Record<
            number,
            {
              extra_id: number;
              quantity: number;
              code: string | null;
              name: string | null;
              price: number;
              currency: string;
            }[]
          > = {};

          pkgExtras.forEach((pe) => {
            const ex = extraMap[pe.extra_id];
            if (!ex) return;
            if (!eByPkg[pe.package_id]) eByPkg[pe.package_id] = [];
            eByPkg[pe.package_id].push({
              extra_id: pe.extra_id,
              quantity: pe.quantity,
              code: ex.code,
              name: ex.name,
              price: ex.price ?? 0,
              currency: ex.currency ?? 'GHS',
            });
          });

          setExtrasByPackage(eByPkg);
        } else {
          setExtrasByPackage({});
        }

        // 4) If a package was preselected, jump to dates
        if (initialPackageId) {
          setStage('dates');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load packages.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [isOpen, initialPackageId]);

  // ========== EXACT LOGIC FROM BOOKINGWIDGET: Load disabled dates ==========
    // ========== Load disabled dates based on actual package availability ==========
  useEffect(() => {
    if (!isOpen || stage !== 'dates' || !selectedPackageId) return;

    async function loadDisabledDates() {
      try {
        const pkg = packages.find((p) => p.id === selectedPackageId);
        const rooms =
          selectedPackageId != null ? roomsByPackage[selectedPackageId] ?? [] : [];


        // If we don't have a package or it has no linked cabins, don't block anything here
        if (!pkg || rooms.length === 0) {
          disabledDatesRef.current = [];
          setDisabledDates([]);
          return;
        }

        const nights = pkg.nights ?? 1;

        // Build lookup maps for rooms in this package
        const roomKeyById: Record<string, string> = {};
        const roomKeyByCode: Record<string, string> = {};
        const occupancy: Record<string, Set<string>> = {};

        rooms.forEach((room) => {
          const key = String(room.id);
          occupancy[key] = new Set<string>();
          roomKeyById[String(room.id)] = key;
          if (room.code) roomKeyByCode[room.code] = key;
        });

        // Horizon: from today for 1 year
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const horizonEnd = new Date(today);
        horizonEnd.setFullYear(horizonEnd.getFullYear() + 1);

        const horizonStartISO = toLocalISO(today);
        const horizonEndISO = toLocalISO(horizonEnd);


        // 1) Fetch all reservations overlapping the horizon,
        //    then match them to package rooms by id *or* code
        const resUrl =
          `${SUPABASE_URL}/rest/v1/reservations` +
          `?select=room_type_id,room_type_code,check_in,check_out,status` +
          `&check_in=lt.${horizonEndISO}&check_out=gt.${horizonStartISO}` +
          `&status=not.in.("cancelled","no_show")`;

        const reservations = await fetchJSON<{
          room_type_id: string | null;
          room_type_code: string | null;
          check_in: string;
          check_out: string;
          status: string | null;
        }[]>(resUrl);

        reservations.forEach((r) => {
          if (!r.check_in || !r.check_out) return;

          const idKey = r.room_type_id
            ? roomKeyById[String(r.room_type_id)]
            : undefined;
          const codeKey = r.room_type_code
            ? roomKeyByCode[r.room_type_code]
            : undefined;

          const key = idKey ?? codeKey;
          if (!key) return; // reservation not for a room in this package

          let cur = new Date(r.check_in + 'T00:00:00');
          const end = new Date(r.check_out + 'T00:00:00');
          if (isNaN(cur.getTime()) || isNaN(end.getTime())) return;

          const set = occupancy[key];
          if (!set) return;

          // mark [check_in, check_out) as occupied
          while (cur < end) {
            set.add(toLocalISO(cur));
            cur.setDate(cur.getDate() + 1);
          }

        });

        // 2) Fetch blocked dates for these rooms (blocked_dates only has room_type_id)
        const roomIds = rooms.map((r) => r.id).filter((id) => id != null);
        if (roomIds.length) {
          const blockedUrl =
            `${SUPABASE_URL}/rest/v1/blocked_dates` +
            `?select=room_type_id,blocked_date` +
            `&room_type_id=in.(${roomIds.join(',')})`;

          const blocked = await fetchJSON<{
            room_type_id: number;
            blocked_date: string;
          }[]>(blockedUrl);

          blocked.forEach((b) => {
            const key = roomKeyById[String(b.room_type_id)];
            if (!key || !b.blocked_date) return;
            occupancy[key]?.add(String(b.blocked_date).slice(0, 10));

          });
        }

        const disabled: string[] = [];

        // 3) For each potential check-in date in the horizon,
        //    disable if *no* room is free for the whole package stay.
        const ciCursor = new Date(today);
        while (ciCursor <= horizonEnd) {
          const ciStr = toLocalISO(ciCursor);


          // Always enforce package validity on check-in
          if (pkg.valid_from && ciStr < pkg.valid_from) {
            disabled.push(ciStr);
            ciCursor.setDate(ciCursor.getDate() + 1);
            continue;
          }
          // Always enforce package validity on check-in (and entire stay)
          if (pkg.valid_from && ciStr < pkg.valid_from) {
            disabled.push(ciStr);
            ciCursor.setDate(ciCursor.getDate() + 1);
            continue;
          }

          const coStr = addDaysISO(ciStr, nights);

          // If valid_until is the last allowed date for the package period,
          // ensure the *checkout* does not exceed it.
          if (pkg.valid_until && coStr > pkg.valid_until) {
            disabled.push(ciStr);
            ciCursor.setDate(ciCursor.getDate() + 1);
            continue;
          }


          let hasAvailableRoom = false;

          for (const room of rooms) {
            const key = String(room.id);
            const occ = occupancy[key] ?? new Set<string>();
            let roomFree = true;

            for (let i = 0; i < nights; i++) {
              const d = new Date(ciCursor);
              d.setDate(d.getDate() + i);
              const dStr = toLocalISO(d);
              if (occ.has(dStr)) {
                roomFree = false;
                break;
              }
            }

            if (roomFree) {
              hasAvailableRoom = true;
              break;
            }
          }

          if (!hasAvailableRoom) {
            disabled.push(ciStr);
          }

          ciCursor.setDate(ciCursor.getDate() + 1);
        }

        disabledDatesRef.current = disabled;
        setDisabledDates(disabled);
      } catch (err) {
        console.error('Error loading disabled dates:', err);
        // On error, don't block extra dates
        disabledDatesRef.current = [];
        setDisabledDates([]);
      }
    }

    loadDisabledDates();
  }, [isOpen, stage, selectedPackageId, packages, roomsByPackage]);

  const nights = useMemo(() => diffNights(checkIn, checkOut), [checkIn, checkOut]);

    // ========== Compute invalid CHECK-OUT dates for current check-in ==========
  useEffect(() => {
    if (!isOpen || stage !== 'dates' || !selectedPackageId || !checkIn) {
      invalidCheckoutDatesRef.current = [];
      setInvalidCheckoutDates([]);
      return;
    }

    async function loadInvalidCheckoutDates() {
      try {
        const pkg = packages.find((p) => p.id === selectedPackageId);
        const rooms =
          selectedPackageId != null ? roomsByPackage[selectedPackageId] ?? [] : [];


        if (!pkg || rooms.length === 0) {
          invalidCheckoutDatesRef.current = [];
          setInvalidCheckoutDates([]);
          return;
        }

        const minNights = pkg.nights ?? 1;

        // Build lookup maps + occupancy for this package's rooms
        const roomKeyById: Record<string, string> = {};
        const roomKeyByCode: Record<string, string> = {};
        const occupancy: Record<string, Set<string>> = {};

        rooms.forEach((room) => {
          const key = String(room.id);
          occupancy[key] = new Set<string>();
          roomKeyById[String(room.id)] = key;
          if (room.code) roomKeyByCode[room.code] = key;
        });

        // Horizon for this check-in: from check-in up to 1 year (or validity end)
        const ciDate = new Date(checkIn + 'T00:00:00');
        ciDate.setHours(0, 0, 0, 0);

        const horizonEnd = new Date(ciDate);
        horizonEnd.setFullYear(horizonEnd.getFullYear() + 1);

        // clamp by package valid_until if any
        if (pkg.valid_until) {
          const vEnd = new Date(pkg.valid_until + 'T00:00:00');
          if (vEnd < horizonEnd) horizonEnd.setTime(vEnd.getTime());
        }

        const horizonStartISO = toLocalISO(ciDate);
        const horizonEndISO = toLocalISO(horizonEnd);


        // 1) Reservations overlapping [checkIn, horizonEnd]
        const resUrl =
          `${SUPABASE_URL}/rest/v1/reservations` +
          `?select=room_type_id,room_type_code,check_in,check_out,status` +
          `&check_in=lt.${horizonEndISO}&check_out=gt.${horizonStartISO}` +
          `&status=not.in.("cancelled","no_show")`;

        const reservations = await fetchJSON<{
          room_type_id: string | null;
          room_type_code: string | null;
          check_in: string;
          check_out: string;
          status: string | null;
        }[]>(resUrl);

        reservations.forEach((r) => {
          if (!r.check_in || !r.check_out) return;

          const idKey = r.room_type_id
            ? roomKeyById[String(r.room_type_id)]
            : undefined;
          const codeKey = r.room_type_code
            ? roomKeyByCode[r.room_type_code]
            : undefined;

          const key = idKey ?? codeKey;
          if (!key) return;

          let cur = new Date(r.check_in + 'T00:00:00');
          const end = new Date(r.check_out + 'T00:00:00');
          if (isNaN(cur.getTime()) || isNaN(end.getTime())) return;

          const set = occupancy[key];
          if (!set) return;

          while (cur < end) {
            set.add(toLocalISO(cur));
            cur.setDate(cur.getDate() + 1);
          }

        });

        // 2) Blocked dates for these rooms
        const roomIds = rooms.map((r) => r.id).filter((id) => id != null);
        if (roomIds.length) {
          const blockedUrl =
            `${SUPABASE_URL}/rest/v1/blocked_dates` +
            `?select=room_type_id,blocked_date` +
            `&room_type_id=in.(${roomIds.join(',')})`;

          const blocked = await fetchJSON<{
            room_type_id: number;
            blocked_date: string;
          }[]>(blockedUrl);

          blocked.forEach((b) => {
            const key = roomKeyById[String(b.room_type_id)];
            if (!key || !b.blocked_date) return;
            occupancy[key]?.add(String(b.blocked_date).slice(0, 10));
          });
        }

        const invalid: string[] = [];

        // 3) For each possible CHECK-OUT date after min nights,
        //    mark it invalid if no room can host [checkIn, checkout)
        const minCoDate = new Date(ciDate);
        minCoDate.setDate(minCoDate.getDate() + minNights);

        const coCursor = new Date(minCoDate);
        while (coCursor <= horizonEnd) {
          const coStr = toLocalISO(coCursor);

          let hasAvailableRoomForStay = false;

          const stayNights =
            Math.round(
              (coCursor.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24)
            ) || 0;

          if (stayNights < minNights) {
            invalid.push(coStr);
            coCursor.setDate(coCursor.getDate() + 1);
            continue;
          }

          for (const room of rooms) {
            const key = String(room.id);
            const occ = occupancy[key] ?? new Set<string>();
            let roomFree = true;

            for (let i = 0; i < stayNights; i++) {
              const d = new Date(ciDate);
              d.setDate(d.getDate() + i);
              const dStr = toLocalISO(d);
              if (occ.has(dStr)) {
                roomFree = false;
                break;
              }
            }

            if (roomFree) {
              hasAvailableRoomForStay = true;
              break;
            }
          }

          if (!hasAvailableRoomForStay) {
            invalid.push(coStr);
          }

          coCursor.setDate(coCursor.getDate() + 1);
        }

        invalidCheckoutDatesRef.current = invalid;
        setInvalidCheckoutDates(invalid);
      } catch (err) {
        console.error('Error loading invalid checkout dates:', err);
        invalidCheckoutDatesRef.current = [];
        setInvalidCheckoutDates([]);
      }
    }

    loadInvalidCheckoutDates();
  }, [isOpen, stage, selectedPackageId, packages, roomsByPackage, checkIn]);

  function handleSelectPackage(pkgId: number) {
    setSelectedPackageId(pkgId);
    setStage('dates');
  }

  // Availability filter – same idea as BookingWidget:
  // look at all reservations, then remove rooms that have an overlapping, active booking.
    // Helper: compute which rooms are actually free for the selected dates,
  // mirroring the BookingWidget behaviour.
  async function refreshAvailableRoomsForSelectedPackage() {
    if (!selectedPackageId) {
      setAvailableRoomsForSelected([]);
      return;
    }

    const rooms =
    selectedPackageId != null ? roomsByPackage[selectedPackageId] ?? [] : [];

    if (!rooms.length) {
      setAvailableRoomsForSelected([]);
      return;
    }

    const ci = checkIn;
    const co = checkOut;

    try {
      // 1) Load ALL reservations that overlap the selected date range.
      //    (We don't filter by room in SQL – we match by id/code in JS,
      //     like the booking widget does.)
      const resUrl =
      `${SUPABASE_URL}/rest/v1/reservations` +
      `?select=room_type_id,room_type_code,check_in,check_out,status` +
      `&check_in=lt.${co}&check_out=gt.${ci}` +
      `&status=not.in.("cancelled","no_show")`;


      const reservations = await fetchJSON<
        {
          room_type_id: string | null;
          room_type_code: string | null;
          check_in: string;
          check_out: string;
          status: string | null;
        }[]
      >(resUrl);

      // 2) Load blocked dates for these room types in the same range
      const roomIds = rooms.map((r) => String(r.id));
      const idList = roomIds.join(',');
      const blockedUrl =
        `${SUPABASE_URL}/rest/v1/blocked_dates` +
        `?select=room_type_id,blocked_date` +
        `&blocked_date=gte.${ci}&blocked_date=lt.${co}` +
        (idList ? `&room_type_id=in.(${idList})` : '');

      const blocked = await fetchJSON<
        { room_type_id: string | null; blocked_date: string }[]
      >(blockedUrl);

      const available = rooms.filter((room) => {
        const roomId = String(room.id);
        const roomCode = room.code ?? null;

        // Any overlapping reservation for this room?
        const hasReservation = reservations.some((r) => {
          const sameRoom =
            (r.room_type_id && String(r.room_type_id) === roomId) ||
            (roomCode && r.room_type_code && r.room_type_code === roomCode);

          if (!sameRoom) return false;

          const existingStart = new Date(r.check_in).getTime();
          const existingEnd = new Date(r.check_out).getTime();
          const start = new Date(ci).getTime();
          const end = new Date(co).getTime();

          // Overlap if existingStart < end && existingEnd > start
          return existingStart < end && existingEnd > start;
        });

        if (hasReservation) return false;

        // Any blocked date for this room in the range?
        const hasBlock = blocked.some(
          (b) => b.room_type_id && String(b.room_type_id) === roomId
        );
        if (hasBlock) return false;

        return true;
      });

      setAvailableRoomsForSelected(available);
    } catch (err) {
      console.error('Error refreshing available rooms for package:', err);
      // On error, show NO rooms so we don’t falsely show fully-booked cabins
      setAvailableRoomsForSelected([]);
    }
  }

  // Move from package+dates → room selection
  async function handleNextToRooms() {
    if (!selectedPackageId) {
      setError('Please select a package.');
      return;
    }
    const pkg = packages.find((p) => p.id === selectedPackageId);
    if (!pkg) return;

    const n = diffNights(checkIn, checkOut);
    if (n < (pkg.nights ?? 0)) {
      setError(`This package requires at least ${pkg.nights} night(s).`);
      return;
    }

    // Validate dates are within validity period
    if (pkg.valid_from || pkg.valid_until) {
      const ciDate = new Date(checkIn);
      if (pkg.valid_from) {
        const validFrom = new Date(pkg.valid_from);
        if (ciDate < validFrom) {
          setError(`Check-in must be on or after ${formatDate(pkg.valid_from)}`);
          return;
        }
      }
      if (pkg.valid_until) {
        const validUntil = new Date(pkg.valid_until);
        if (ciDate > validUntil) {
          setError(`Check-in must be on or before ${formatDate(pkg.valid_until)}`);
          return;
        }
      }
    }

    setError(null);

    // Run the availability check BEFORE showing the cabins list
    await refreshAvailableRoomsForSelectedPackage();

    setStage('rooms');
  }

  function handleNextToDetails() {
    if (!selectedRoomId) {
      setError('Please select a cabin.');
      return;
    }
    setError(null);
    setStage('details');
  }



  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!selectedPackageId || !selectedRoomId) {
    setError('Missing selection.');
    return;
  }
  if (!termsAccepted) {
    setError('You must accept the terms and conditions.');
    return;
  }

  const pkg = packages.find((p) => p.id === selectedPackageId);
  const room = roomsForSelected.find((r) => r.id === selectedRoomId);
  if (!pkg || !room) {
    setError('Invalid package or room.');
    return;
  }

  setSubmitting(true);
  setError(null);
  setSuccess(null);

  try {
    // --- compute extras + room subtotal ---
    const pkgExtras = extrasByPackage[selectedPackageId] ?? [];
    const extras_total = pkgExtras.reduce(
      (sum, ex) => sum + (ex.price ?? 0) * (ex.quantity ?? 1),
      0
    );
    const room_subtotal = (pkg.package_price ?? 0) - extras_total;
    const packageTotal = pkg.package_price ?? 0;

    // Prepare payment data
    const paymentData = {
      roomTypeCode: room.code ?? '',
      roomName: room.name ?? 'Cabin',
      checkIn: checkIn,
      checkOut: checkOut,
      nights,
      adults,
      roomSubtotal: room_subtotal,
      extrasTotal: extras_total,
      discountAmount: 0,
      finalTotal: packageTotal,
      currency: pkg.currency ?? 'GHS',
      guest: {
        first: firstName,
        last: lastName,
        email: email,
        phone: phone,
        countryCode: countryCode
      },
      extras: pkgExtras.map((ex: any) => ({
        code: ex.code,
        name: ex.name,
        price: ex.price ?? 0,
        qty: ex.quantity ?? 1
      })),
      couponCode: null,
      isGroupBooking: false,
      groupReservationCode: null,
      allRooms: null,
      // Package-specific data
      isPackage: true,
      packageId: selectedPackageId,
      packageCode: pkg.code,
      packageName: pkg.name
    };

    console.log('Calling payment API for package:', paymentData);

    // Call payment initialization API
    const paymentResponse = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Payment API error:', errorText);
      throw new Error('Payment initialization failed');
    }

    const responseText = await paymentResponse.text();
    const paymentResult = JSON.parse(responseText);

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment initialization failed');
    }
        // DEBUG
    console.log('=== PACKAGE EXTRAS DEBUG ===');
    console.log('pkgExtras:', pkgExtras);
    console.log('pkgExtras length:', pkgExtras?.length);
    if (pkgExtras && pkgExtras.length > 0) {
      console.log('First extra:', pkgExtras[0]);
      console.log('Mapped extras:', pkgExtras.map((ex: any) => ({
        name: ex.name,
        price: ex.price,
        qty: ex.quantity
      })));
    }
    console.log('=========================');
    // Store booking info for callback page
    sessionStorage.setItem('pending_booking', JSON.stringify({
      reference: paymentResult.reference,
      confirmationCode: paymentResult.confirmationCode,    // ⭐ ADD THIS
      amount: packageTotal,
      currency: pkg.currency ?? 'GHS',
      guestName: `${firstName} ${lastName}`,
      guestEmail: email,
      checkIn: checkIn,
      checkOut: checkOut,
      roomName: room.name ?? 'Cabin',
      nights: nights,
      // Package-specific info
      packageName: pkg.name ?? 'Package',
      isPackage: true,
      // NEW: Add package extras for display
      packageExtras: pkgExtras.map((ex: any) => ({
        name: ex.name,
        price: ex.price ?? 0,
        qty: ex.quantity ?? 1
      }))
    }));

    console.log('Redirecting to Paystack:', paymentResult.authorization_url);

    // Redirect to Paystack
    window.location.href = paymentResult.authorization_url;

  } catch (err: any) {
    setError(err.message || 'Payment initialization failed.');
    setSubmitting(false);
  }
}

function formatDate(isoDate?: string | null): string {
  return formatDateDDMMMYYYY(isoDate);
  }

  // ========== EXACT DATE PICKER LOGIC FROM BOOKINGWIDGET ==========
  
  // Generate calendar days for a given month
  function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }

  // Check if a date is disabled (EXACT logic from BookingWidget)
    function isDateDisabled(dateStr: string, pickerId?: 'ci' | 'co'): boolean {
    const disabled = disabledDatesRef.current;
    const invalidCo = invalidCheckoutDatesRef.current;
    const dateObj = new Date(dateStr);


    // 1) Block all dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return true;
    }

    // 2) For checkout picker, enforce minimum nights from check-in
    if (pickerId === 'co' && checkIn && selectedPkg?.nights) {
      const minCheckOut = addDaysISO(checkIn, selectedPkg.nights);
      const minCheckOutObj = new Date(minCheckOut);
      if (dateObj < minCheckOutObj) {
        return true;
      }
    }

    // 3) Capacity / blocked-dates - block for BOTH check-in AND check-out
    // Check-in: block if the date itself is disabled
    // Check-out: block if ANY date in the stay range is disabled
    if (disabled.indexOf(dateStr) !== -1) {
      return true;
    }

    // 4) For CHECK-OUT, also block if any date in the range is blocked
    if (pickerId === 'co' && checkIn && selectedPkg?.nights) {
      // Check if any date from check-in to this checkout is blocked
      const nights = selectedPkg.nights;
      const checkInObj = new Date(checkIn);
      const checkOutObj = new Date(dateStr);
      
      // Iterate through each night of the stay
      for (let i = 0; i < nights; i++) {
        const stayDate = new Date(checkInObj);
        stayDate.setDate(stayDate.getDate() + i);
        const stayDateStr = toLocalISO(stayDate);
        
        if (disabled.indexOf(stayDateStr) !== -1) {
          return true;  // Block checkout if any night is unavailable
        }
      }
    }

    // 5) For CHECK-OUT, block dates where no room can host the full stay
    if (pickerId === 'co' && invalidCo.indexOf(dateStr) !== -1) {
      return true;
    }

    // 5) Package validity window
    if (selectedPkg) {
      if (selectedPkg.valid_from) {
        const validFrom = new Date(selectedPkg.valid_from);
        if (dateObj < validFrom) {
          return true;
        }
      }
      if (selectedPkg.valid_until) {
        const validUntil = new Date(selectedPkg.valid_until);
        if (dateObj > validUntil) {
          return true;
        }
      }
    }

    return false;
  }



  // Format date as YYYY-MM-DD (EXACT logic from BookingWidget)
  function formatDateDDMMYYYY(day: number, month: number, year: number): string {
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }
  
  // Handle date selection
  function handleDateClick(dateStr: string, pickerId: 'ci' | 'co') {
    if (isDateDisabled(dateStr, pickerId)) return;

    if (pickerId === 'ci') {
      setCheckIn(dateStr);
      // Auto-calculate checkout based on minimum package nights for convenience
      if (selectedPkg?.nights) {
        const newCheckOut = addDaysISO(dateStr, selectedPkg.nights);
        setCheckOut(newCheckOut);
      }
      setActivePickerId(null);
    } else {
      // For checkout, validate minimum nights
      if (checkIn && selectedPkg?.nights) {
        const minCheckOut = addDaysISO(checkIn, selectedPkg.nights);
        const selectedDate = new Date(dateStr);
        const minDate = new Date(minCheckOut);
        
        if (selectedDate >= minDate) {
          setCheckOut(dateStr);
          setActivePickerId(null);
        } else {
          setError(`Check-out must be at least ${selectedPkg.nights} night(s) after check-in`);
        }
      } else {
        setCheckOut(dateStr);
        setActivePickerId(null);
      }
    }
  }

  // Navigate calendar month
  function changeMonth(pickerId: 'ci' | 'co', direction: 1 | -1) {
    setCurrentPickerMonth(prev => {
      const current = new Date(prev[pickerId]);
      current.setMonth(current.getMonth() + direction);
      return { ...prev, [pickerId]: current };
    });
  }

  // Render the calendar with safety checks
  function renderCalendar(pickerId: 'ci' | 'co') {
    const monthDate = currentPickerMonth?.[pickerId];
    if (!monthDate || !(monthDate instanceof Date) || isNaN(monthDate.getTime())) {
      return null;
    }

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = generateCalendarDays(year, month);

    // Safety check - ensure days array exists
    if (!days || !Array.isArray(days)) {
      return null;
    }

    return (
      <div className="absolute z-50 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl p-4 w-80">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => changeMonth(pickerId, -1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            ←
          </button>
          <h3 className="font-medium text-slate-900">
            {monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            type="button"
            onClick={() => changeMonth(pickerId, 1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }

            const dateStr = formatDateDDMMYYYY(day, month, year);
            const disabled = isDateDisabled(dateStr, pickerId);
            const isSelected = dateStr === (pickerId === 'ci' ? checkIn : checkOut);

            return (
              <button
                key={day}
                type="button"
                onClick={() => !disabled && handleDateClick(dateStr, pickerId)}
                disabled={disabled}
                className={`
                  aspect-square p-2 text-sm rounded-lg transition
                  ${disabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                    : isSelected
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'hover:bg-orange-100 text-slate-900'
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-start justify-center p-4 py-8">
        <div className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-lg transition"
          >
            <span className="text-2xl leading-none">×</span>
          </button>

          {loading ? (
            <div className="p-8 text-center">Loading packages...</div>
          ) : (
            <>
              {/* STAGE 1: Package Selection */}
              {stage === 'packages' && (
                <div className="p-8">
                  <h2 className="text-3xl font-serif font-light text-slate-900 mb-2">
                    Choose Your Package
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Select the perfect package for your getaway
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => {
                      const isSoldOut = !nextAvailableByPackage[pkg.id];
                      return (
                      <div
                        key={pkg.id}
                        onClick={() => !isSoldOut && handleSelectPackage(pkg.id)}
                        className={`group bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-500 flex flex-col border ${isSoldOut ? 'border-stone-200 opacity-75 cursor-not-allowed' : 'border-stone-100 hover:shadow-xl cursor-pointer'}`}
                      >
                        {/* Package Image */}
                        {pkg.image_url && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={pkg.image_url}
                              alt={pkg.name ?? ''}
                              className={`w-full h-full object-cover transition-transform duration-700 ${isSoldOut ? 'grayscale' : 'group-hover:scale-110'}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {isSoldOut && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                                Sold Out
                              </div>
                            )}
                          </div>
                        )}

                        {/* Package Content */}
                        <div className="p-5 md:p-6 flex flex-col flex-1">
                          {/* Package Name */}
                          <h3 className="text-xl md:text-2xl font-serif font-light text-stone-900 leading-tight mb-2">
                            {pkg.name}
                          </h3>

                          {/* Price immediately under name */}
                          {pkg.package_price != null && (
                            <p className="font-bold text-2xl text-stone-900 mb-4">
                              {pkg.currency} {pkg.package_price.toLocaleString()}
                            </p>
                          )}

                          {/* Separator */}
                          <div className="h-px bg-stone-200 mb-4" />

                          {/* Package Details - Nights */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                              <span>{pkg.nights} night{pkg.nights !== 1 ? 's' : ''} exact</span>
                            </div>
                          </div>

                          {/* Separator */}
                          <div className="h-px bg-stone-200 mb-4" />

                          {/* Includes Section with background */}
                          {(extrasByPackage[pkg.id] ?? []) && (extrasByPackage[pkg.id] ?? []).length > 0 && (
                            <>
                              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                                <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Includes</p>
                                <ul className="space-y-1.5">
                                  {(extrasByPackage[pkg.id] ?? []).map((ex, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-stone-700">
                                      <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>{ex.name}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {/* Separator */}
                              <div className="h-px bg-stone-200 mb-4" />
                            </>
                          )}

                          {/* Validity Period with background */}
                          {(pkg.valid_from || pkg.valid_until) && (
                            <>
                              <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                                <p className="text-xs tracking-widest uppercase text-stone-500 mb-1.5">Valid Period</p>
                                <p className="text-sm text-stone-700 font-medium">
                                  {pkg.valid_from && formatDate(pkg.valid_from)}
                                  {pkg.valid_from && pkg.valid_until && ' – '}
                                  {pkg.valid_until && formatDate(pkg.valid_until)}
                                </p>
                              </div>
                              {/* Separator */}
                              <div className="h-px bg-stone-200 mb-4" />
                            </>
                          )}

                          {/* Availability / Sold Out */}
                          <div className="flex items-center gap-2 text-sm mb-4">
                            {nextAvailableByPackage[pkg.id] ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-stone-600">
                                  Available from{' '}
                                  <span className="font-medium text-stone-900">
                                    {formatDate(nextAvailableByPackage[pkg.id] as string)}
                                  </span>
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                <span className="text-red-500 font-semibold uppercase tracking-wide">Sold Out</span>
                              </>
                            )}
                          </div>
                          <div className="h-px bg-stone-200 mb-4" />

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Select Button */}
                          <button
                            type="button"
                            disabled={isSoldOut}
                            className={`w-full py-3.5 rounded-xl text-sm tracking-wide font-medium transition-all duration-300 ${isSoldOut ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]'}`}
                          >
                            {isSoldOut ? 'Sold Out' : 'Select Package'}
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>

                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      onClick={onClose}
                      className="px-8 py-3 rounded-full border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: Date Selection */}
              {stage === 'dates' && selectedPkg && (
                <div className="p-8 pb-96">
                  <button
                    onClick={() => {
                      setStage('packages');
                      setSelectedPackageId(null);
                    }}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                  >
                    <span>←</span> Back to Packages
                  </button>

                  <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                    <h3 className="text-xl font-serif font-light text-slate-900 mb-2">
                      {selectedPkg.name}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-slate-700">
                      <span>{selectedPkg.nights} night{selectedPkg.nights !== 1 ? 's' : ''} exact</span>
                      <span className="font-semibold">
                        {selectedPkg.currency} {selectedPkg.package_price?.toFixed(2)}
                      </span>
                    </div>
                    {(selectedPkg.valid_from || selectedPkg.valid_until) && (
                      <p className="mt-2 text-sm text-orange-800">
                        Valid: {selectedPkg.valid_from && formatDate(selectedPkg.valid_from)}
                        {selectedPkg.valid_from && selectedPkg.valid_until && ' – '}
                        {selectedPkg.valid_until && formatDate(selectedPkg.valid_until)}
                      </p>
                    )}
                  </div>

                  <h2 className="text-3xl font-serif font-light text-slate-900 mb-2">
                    Select Your Dates
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Choose your check-in date (checkout will be set automatically based on package duration)
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      {error}
                    </div>
                  )}

                  {/* Date Inputs with Custom Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Check-in */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Check-in
                      </label>
                      <input
                        type="text"
                        value={formatDateDDMMMYYYY(checkIn)}
                        readOnly
                        onClick={() => setActivePickerId(activePickerId === 'ci' ? null : 'ci')}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white cursor-pointer hover:border-orange-500 focus:border-orange-500 focus:outline-none transition"
                      />
                      
                      {/* Custom Date Picker for Check-in */}
                      {activePickerId === 'ci' && renderCalendar('ci')}
                    </div>

                    {/* Check-out (locked - auto-calculated from check-in) */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Check-out
                      </label>
                      <input
                        type="text"
                        value={formatDateDDMMMYYYY(checkOut)}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed text-slate-600"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Exact {selectedPkg?.nights} night{selectedPkg?.nights !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setStage('packages');
                        setSelectedPackageId(null);
                      }}
                      className="px-8 py-3 rounded-full border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextToRooms}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:from-orange-600 hover:to-orange-500 transition shadow-lg"
                    >
                      Continue to Cabins
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: Room Selection */}
              {stage === 'rooms' && (
                <div className="p-8">
                  <button
                    onClick={() => setStage('dates')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                  >
                    <span>←</span> Back to Dates
                  </button>

                  <h2 className="text-3xl font-serif font-light text-slate-900 mb-2">
                    Choose Your Cabin
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Select your preferred cabin for this package
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      {error}
                    </div>
                  )}

                  {availableRoomsForSelected.length === 0 ? (
                    <div className="mb-8 p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                      <p className="text-slate-600 mb-2">
                        No cabins are available for the selected dates.
                      </p>
                      <p className="text-sm text-slate-500">
                        Please go back and choose different dates.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {availableRoomsForSelected.map((room) => (
                        <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`group relative bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                          selectedRoomId === room.id
                            ? 'border-orange-500 shadow-xl'
                            : 'border-slate-200 hover:border-orange-300 hover:shadow-lg'
                        }`}
                      >
                        {room.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={room.image_url}
                              alt={room.name ?? ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <div className="p-6">
                          <h3 className="text-xl font-serif font-light text-slate-900 mb-2">
                            {room.name}
                          </h3>
                          
                          {room.max_adults && (
                            <p className="text-sm text-slate-600">
                              Max {room.max_adults} guests
                            </p>
                          )}

                          {selectedRoomId === room.id && (
                            <div className="mt-4 flex items-center gap-2 text-orange-600 font-medium">
                              <span className="text-lg">✓</span>
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setStage('dates')}
                      className="px-8 py-3 rounded-full border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextToDetails}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:from-orange-600 hover:to-orange-500 transition shadow-lg"
                    >
                      Continue to Details
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: Guest Details */}
              {stage === 'details' && (
                <div className="p-8">
                  <button
                    onClick={() => setStage('rooms')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                  >
                    <span>←</span> Back to Cabins
                  </button>

                  <h2 className="text-3xl font-serif font-light text-slate-900 mb-2">
                    Guest Details
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Complete your booking information
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Number of Guests *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={selectedRoom?.max_adults ?? 10}
                          required
                          value={adults}
                          onChange={(e) => setAdults(parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                                        <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative" ref={ccRef}>
                          <button
                            type="button"
                            onClick={() => { setCcOpen(!ccOpen); setCcSearch(''); }}
                            className="w-full flex items-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-left text-sm hover:border-slate-300 focus:border-orange-500 focus:outline-none transition"
                          >
                            <span className="text-xl leading-none">{selectedCountry.flag}</span>
                            <span className="flex-1 truncate">{selectedCountry.name} ({selectedCountry.code})</span>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${ccOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {ccOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                              <input
                                type="text"
                                value={ccSearch}
                                onChange={(e) => setCcSearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full px-4 py-3 border-b border-slate-200 text-sm outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="max-h-56 overflow-y-auto">
                                {filteredCountries.length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-slate-400 text-center">No countries found</div>
                                ) : (
                                  filteredCountries.map((c) => (
                                    <button
                                      key={c.name}
                                      type="button"
                                      onClick={() => { setCountryCode(c.code); setCcOpen(false); setCcSearch(''); }}
                                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition text-left ${countryCode === c.code && selectedCountry.name === c.name ? 'bg-orange-50 font-semibold' : ''}`}
                                    >
                                      <span className="text-xl leading-none flex-shrink-0">{c.flag}</span>
                                      <span className="flex-1 truncate">{c.name}</span>
                                      <span className="text-slate-400 text-xs flex-shrink-0">{c.code}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition resize-none"
                        placeholder="Any special requests or requirements..."
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="terms" className="text-sm text-slate-700">
                        I accept the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-orange-600 hover:underline"
                        >
                          Terms and Conditions
                        </button>
                        *
                      </label>
                    </div>

                    {/* Booking Summary */}
                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Booking Summary
                      </h3>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Package</span>
                          <span className="font-medium text-slate-900">{selectedPkg?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cabin</span>
                          <span className="font-medium text-slate-900">{selectedRoom?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Check-in</span>
                          <span className="font-medium text-slate-900">{formatDate(checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Check-out</span>
                          <span className="font-medium text-slate-900">{formatDate(checkOut)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Nights</span>
                          <span className="font-medium text-slate-900">{nights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Guests</span>
                          <span className="font-medium text-slate-900">{adults}</span>
                        </div>
                        
                        {extrasForSelectedPackage.length > 0 && (
                          <>
                            <div className="pt-3 border-t border-slate-300">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                Package Includes
                              </p>
                              {extrasForSelectedPackage.map((ex, idx) => (
                                <div key={idx} className="flex justify-between text-slate-700 mb-1">
                                  <span className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    {ex.name}
                                  </span>
                                  <span>×{ex.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}


                        <div className="pt-4 border-t-2 border-slate-300 flex justify-between text-lg">
                          <span className="font-semibold text-slate-900">Total</span>
                          <span className="font-bold text-slate-900">
                            {selectedPkg?.currency} {formatNumber(total.toFixed(2))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setStage('rooms')}
                        className="px-8 py-3 rounded-full border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:from-orange-600 hover:to-orange-500 transition shadow-lg disabled:opacity-50"
                      >
                        {submitting ? 'Processing...' : 'Complete Booking'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Confirmation Modal */}
          {confirmation && (
            <div className="fixed inset-0 z-[60] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="relative bg-white max-w-2xl w-full rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif font-light text-slate-900 mb-2">
                    Booking Confirmed!
                  </h3>
                  <p className="text-slate-600">
                    Your reservation has been successfully created
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Confirmation Code</span>
                    <span className="font-semibold text-slate-900">{confirmation.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Guest Name</span>
                    <span className="font-semibold text-slate-900">{confirmation.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Package</span>
                    <span className="font-semibold text-slate-900">{confirmation.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cabin</span>
                    <span className="font-semibold text-slate-900">{confirmation.roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-in</span>
                    <span className="font-semibold text-slate-900">{formatDate(confirmation.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-out</span>
                    <span className="font-semibold text-slate-900">{formatDate(confirmation.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nights</span>
                    <span className="font-semibold text-slate-900">{confirmation.packageNights}</span>
                  </div>
                  
                  {/* Package Extras/Includes */}
                  {confirmation.packageExtras && confirmation.packageExtras.length > 0 && (
                    <div className="pt-3 border-t border-slate-300">
                      <span className="text-slate-600 block mb-2">Package Includes</span>
                      <div className="space-y-1.5 pl-4">
                        {confirmation.packageExtras.map((extra: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700">{extra.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-slate-300 flex justify-between">
                    <span className="text-slate-600">Total paid</span>
                    <span className="font-semibold text-slate-900">
                      {confirmation.currency} {formatNumber(confirmation.total.toFixed(2))}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-500 text-center">
                  A confirmation email will be sent to you shortly.
                </p>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setConfirmation(null);
                      onClose();
                    }}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:from-orange-600 hover:to-orange-500 transition shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Terms and Conditions Modal */}
          {showTermsModal && (
            <div
              className="fixed inset-0 z-[70] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowTermsModal(false)}
            >
              <div
                className="relative bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between z-10">
                  <h3 className="text-2xl font-serif font-light text-slate-900">
                    Terms & Conditions
                  </h3>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition"
                  >
                    ×
                  </button>
                </div>
                <div className="px-6 py-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="prose prose-slate max-w-none">
                    <h2 className="text-2xl font-serif font-light mb-6 pb-4 border-b border-slate-200">Introduction</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      These Booking Terms &amp; Conditions and the General Booking Information contained on our web
                      site will form the basis of your agreement with Sojourn Cabins (&ldquo;the Company&rdquo;). They apply
                      only to holiday arrangements which you book with us and which we agree to make, provide or
                      perform as applicable as part of our agreement with you and no other third party. This
                      Agreement shall be governed and construed in all respects in accordance with the laws of
                      Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Contract</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      A contract only exists between Sojourn Cabins (&ldquo;we/our/us&rdquo;) and the &ldquo;clients&rdquo; from the time
                      a Confirmation Invoice is dispatched / received and a payment must be made by the available
                      means on our payment portal.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Booking Form</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      To make a booking with Sojourn Cabins a Booking Form will need to be completed accurately at{' '}
                      <a href="https://sojourngh.com" target="_blank" rel="noreferrer" className="text-slate-900 font-medium hover:underline">
                        sojourngh.com
                      </a> and submitted.
                      In the event a booking is made without completing a Booking Form, for instance a telephone
                      booking, it is a condition that the information is accurately given. A telephone booking is a
                      contract between us and the &ldquo;clients&rdquo; from the time a Confirmation/Invoice is dispatched when
                      Credit Card / Debit details will be required. We require full payment before a booking will be
                      completed. Until that time no contract or agreement will be considered to exist between us. On
                      all bookings a damage deposit is required.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Party Leader and Group Composition</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      The Party Leader is the person or agency who holds the booking, to whom all correspondence and
                      invoices are addressed and who is responsible for the rental. Spouses&rsquo; names are not considered
                      interchangeable. Accommodation is provided only for the number of guests shown on the booking
                      form.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Any additional persons wishing to book are required to notify us, as soon as possible and make
                      confirmation in writing with any payment due immediately, unless we advise otherwise, but no
                      later than 8 working days before departure or we reserve the right to refuse any such persons
                      and may cancel the booking.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      No persons other than those stated on the Booking Form or accepted at such later date by
                      Sojourn Cabins as additional persons shall be entitled to utilise and have the benefit of the
                      accommodation and facilities of the property. The number of people staying in the cabin must
                      not exceed the maximum number as shown in our website. Sojourn Cabins will ask any person to
                      leave the assigned cabin in a case of non-compliance. Subletting, sharing or assigning the
                      accommodation is prohibited.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      In the event that a person not named on the Booking Form or accepted as an additional person is
                      deemed by us as agents as utilising the accommodation and facilities, we reserve the right to
                      raise an additional charge for such accommodation etc, which shall be the joint and several
                      liability of the clients. Additionally, should any activity or large gathering of people other
                      than those noted on our invoice take place (e.g. party, wedding reception) we must be informed
                      about it at the time of booking or through any of our Representatives beforehand. Our cabins are let for holiday purposes only and commercial activities may
                      only be carried out with our prior knowledge and or written approval on our invoice. This extra
                      charge varies depending on the property and can be deducted from your credit or debit card
                      without further notice.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Rental Period</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      All rental periods are indicated on your final invoice. Prices shown on our website refer to
                      one night rental period. We do not accept bookings that go beyond 7 days at a time. The rental
                      charge includes: the cabin for the rental period; a walking tour of Anomabo; a change of bed
                      linens, bath towels; house wares such as linens, cooking utensils and china; electricity; water
                      and hot water from taps; garden and pool maintenance; all local taxes.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      It does not include: outgoing telephone calls; Extra Services as requested; eating; chef
                      services; repairs for damages to the property caused by your party; food; travel; car rental;
                      transfers and travel insurance; staff gratuities.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Methods of Payment</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Payments can be made by: debit/credit card, or mobile money transfer via our booking website.
                      All prices are in GHS and payments have to be received in GHS unless otherwise agreed.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Price Guarantee</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Once you have made a booking and made all relevant payments, paid a deposit, we guarantee that
                      the cost of your holiday will not change, no matter what happens to exchange rates or aviation
                      fuel costs. The only exception is Government imposed cost increases such as VAT.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Holiday Pack</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      The Holiday Pack includes all vouchers, list of Extra Services requested, driving directions,
                      contact names and telephone numbers, useful information. The Holiday Pack will be provided once
                      the fully completed Booking Form and the total Invoice Price have been received. The Holiday
                      Pack will not be issued if essential information, including group composition, is missing in the
                      Booking Form. Errors or omissions in the Holiday Pack must be noted and conveyed to us
                      immediately.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Information Booklet</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Please note that the information contained in our Information Booklet is to be considered only
                      as an indication. The information contained in the Information Booklet was accurate at the time
                      of publication and made in good faith. Please check the Invoice and our website as changes might
                      occur and updated information are posted on our website.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Payments</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      All bookings must be paid in full. Sojourn Cabins reserves the right to refuse or terminate any
                      booking where the client has not complied with the payment terms specified. If your bank&rsquo;s
                      country of issue is not within Ghana, please allow at least 5 to 7 days for final payment
                      clearance. It is the responsibility of the client to ensure that all foreign exchange and bank
                      transfer fees are paid to ensure the amounts due are received in full. We advise, particularly
                      for those booking from overseas to phone your credit / debit card company / bank prior to
                      attempting to make a booking so they are aware you are going to be making a payment to Sojourn
                      Cabins. This will eliminate the possibility of your card being rejected on the grounds of fraud
                      protection.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Cancellation by Sojourn Cabins: we reserve the right to cancel your booking if outstanding
                      payments are not received on or before due dates specified on your booking invoice. Where
                      cancellation is required for this reason, all monies already paid less any bank charges and
                      administration costs of GHS 50 will be refunded to you. Should you wish to
                      make alternative payment arrangements, it is your responsibility to contact us immediately to
                      discuss options. We reserve the right in our absolute discretion to refuse a booking without
                      giving reasons.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Full Payment date 56 days before departure: The outstanding balance is due 56 days before
                      departure unless otherwise agreed. If your booking is made within 56 days of departure, the
                      total price becomes due at the time of booking. We must receive a cleared payment by the due
                      date stated on the invoice. If we do not receive this payment in time, we reserve the right to
                      cancel your booking and retain your deposit.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Changes by You (Client)</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Change of dates and cabin size: if you wish to change any part of your booking, you must advise
                      us of any such changes by written notice. We will endeavour to meet reasonable requests for
                      changes, subject to availability, but cannot guarantee to do so. Where it is possible to make
                      changes, we may charge a GHS 50 administration fee unless such changes are outside your control (in
                      which case no fee will be charged). Please note that we are unable to make any changes to
                      bookings within 30 days of departure. We cannot guarantee to make any changes to bookings within
                      56 days of departure and may charge you for any losses we incur in making changes at that time.
                      If the requested change means that your payment(s) increase, we will advise you of the increase.
                      If the requested change means that the total holiday price is reduced, we are not obliged to
                      refund the difference, but shall use our discretion.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Change of party leader or composition: if you wish to transfer your confirmed booking to another
                      person, this can be done provided that we are notified, the full payment is received and an
                      administration charge of GHS 50 is paid. The transferee must provide the information we require
                      and satisfy all the requirements set out in these terms. Both transferor and transferee will be
                      jointly and severally liable for the holiday price and additional charges which will be due at
                      the time of transfer.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Cancellation by You (Client)</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      If you want to cancel your booking, then you or the party leader must contact us immediately in
                      writing (by email or by recorded delivery letter) stating the reason(s). If you do cancel your
                      booking, the following cancellation charges shall apply:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
                      <ul className="space-y-3 list-none pl-0">
                        <li className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">More than 14 days before check-in</span>
                          <span className="font-medium text-slate-900">Full refund less transaction and administration fees</span>
                        </li>
                        <li className="flex justify-between py-2 border-b border-slate-200">
                          <span className="text-slate-600">Between 7 and 14 days before check-in</span>
                          <span className="font-medium text-slate-900">50% of total price less transaction and administration fees</span>
                        </li>
                        <li className="flex justify-between py-2">
                          <span className="text-slate-600">Less than 7 days before check-in</span>
                          <span className="font-medium text-slate-900">Non-refundable</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      If only some members of your group cancel but others decide to continue, no refund will be made
                      for those who cancel but the holiday will continue for the remaining guests. If one of your
                      party is prevented from travelling due to death, injury, illness or other relevant reasons, a
                      refund will not be issued but you may make a claim under your travel insurance policy. If
                      clients reduce group numbers (which causes an increase in price per person) the remaining party
                      must pay the price increase unless we are able to re-let the weeks to other clients. All
                      cancellations must be confirmed in writing to the email address{' '}
                      <a href="mailto:theteam@sojourngh.com" className="text-slate-900 font-medium hover:underline">
                        theteam@sojourngh.com
                      </a>.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Cancellation by Sojourn Cabins</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      In the unlikely event we have to make a significant change or cancel your confirmed holiday
                      booking, we will let you know as soon as possible and offer an alternative cabin or a full
                      refund. Our liability in such circumstances is limited to a full refund of all monies paid.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Arrival &amp; Departure Times</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Normal Check in time: Guests can arrive on the cabin at any time after 2pm on the arrival day.
                      Check out must be by 11am on the departure day. If you arrive or depart early or late, you must
                      make prior arrangements with us &ndash; additional charges may apply.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      The cabins will have been thoroughly cleaned and prepared for your arrival, but if you find
                      anything wrong when you arrive, please inform us immediately. We will use our reasonable
                      endeavours to send someone out to remedy any problem as soon as possible. Please note that
                      arrangements made in respect of departure may be changed at our discretion or by arrangement
                      with us (e.g. you need to leave earlier or later than stated above).
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Travel Insurance</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      We strongly recommend that you arrange comprehensive holiday insurance which covers
                      cancellation, medical expenses, repatriation and loss or damage to luggage and personal
                      possessions prior to travelling. The minimum requirement is that you have a policy covering
                      cancellation and medical expenses and repatriation in case of injury or illness. Any decision
                      not to purchase insurance remains at your own discretion and at your own risk. We shall not be
                      liable for any costs, losses or expenses incurred by you which could have been avoided had you
                      taken out appropriate insurance.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Your Safety and Security</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Sojourn Cabins offer the best value and service for your accommodation and hope that your stay
                      with us is pleasant, safe and trouble free. Please be aware that standards of accommodation and
                      local safety, hygiene and security standards may differ from those you are accustomed to at home
                      in your own country.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      It remains your responsibility to take all sensible precautions throughout your stay. You are
                      responsible for the safety and behaviour of all members of your party. Our properties are not
                      suitable for people with reduced mobility. You must ensure that you and your party arrive in a
                      fit and sober state when taking possession of your accommodation. Use all electrical equipment
                      with care and caution; report any faulty equipment and do not attempt repairs yourself. Follow
                      all instructions displayed at the properties and in the information packs. Make sure children
                      are supervised at all times and take particular care near swimming pools and the beach. Do not
                      allow children to go to the beach unsupervised or swim in the sea.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Special Requests</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      If you have a special request, such as an anniversary cake, please let us know at the time of
                      booking or when you submit the booking form, and we will note your requirement and inform the
                      owner or property agent. We cannot guarantee that such requests will be met but we will do our
                      best to accommodate them where possible. Any costs incurred for the provision of special
                      requests will be notified to you in advance and confirmed on your invoice. Please note that such
                      requests do not constitute any part of our agreement with you unless we actually confirm to you
                      that we can fulfil the request and accept the relevant cost(s).
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Security/Damage Deposits</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Most cabin owners ask that you agree to a &ldquo;Security Deposit&rdquo; which is held to cover any loss or
                      damage to their property caused by you or a member of your party. Security deposits are taken on
                      arrival in cash (GHS or USD), by a pre-authorization with a credit or debit card. Deposits will
                      be refunded within 72 hours of departure providing there is no loss or damage caused by you or
                      any of your party. Please inform us immediately if you do cause any damage. Where, with your
                      consent we will/can automatically deduct said charge from the security/damage deposit being held
                      in the form of credit/debit/cash by Sojourn Cabins. No guests other than those on the booking
                      form can sleep at the property. Wedding celebration breakage deposits are to be paid via bank
                      transfer/credit card/debit card with the balance of your cabin rental on the due date shown on
                      your invoice and will be returned no later than 14 days from the date of departure stated on your
                      invoice subject to zero damages/breakages/unlawful celebrations being reported.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Complaints and Correspondence</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      We hope that you enjoy your holiday and the services of Sojourn Cabins, but if you have any
                      complaints, we want to rectify them as quickly as possible. It is our intention that any
                      complaint is resolved quickly and to your satisfaction. Should you have any complaints / issues
                      with your accommodation upon your arrival you must give Sojourn Cabins a reasonable amount of
                      time to rectify / resolve any such issues. Should any clients of Sojourn Cabins vacate said
                      property before Sojourn Cabins has had time to rectify any issues / complaints we will not be
                      responsible for any costs of relocation or compensation.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      In the unlikely event that you are still dissatisfied with any part of our services, our office
                      team will ask you to record the details by way of photographs and forward these to our Ghana
                      office by email or recorded delivery within 12 days of the complaint or latest, the return date
                      of your holiday with us. Failure to give written notification sent by email / recorded delivery
                      within 12 days of your complaint or latest from the return date of your holiday shall result in
                      our not being liable for any loss or compensation whatsoever or howsoever arising. Sojourn
                      Cabins will respond to your complaint within 14 days of receiving your recorded letter as a
                      management report may be required.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      We can only correspond and accept complaints in written form from the Party Leader and are only
                      able to correspond with the party leader due to the data protection act on any such matters
                      relating to the booking. Similar or same properties may be advertised with other agents. Not
                      giving Sojourn Cabins the option to book/relocate said property as an alternative option will
                      cancel any option of refund/compensation. The Party Leader is the person or agency who holds the
                      booking, to whom all correspondence and invoices are addressed and who is responsible for the
                      rental. We cannot accept complaints from other members in the party. Our maximum liability to
                      you if we are found to have been at fault in relation to the booking is limited to the
                      commission we have earned or are due to earn in relation to the booking in question.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Building Works</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      There may be new building/renovation work taking place close to your cabin. We take steps to try
                      and monitor this and advise you if any building work is likely to affect your cabin. Should we
                      consider that a neighbouring building plot or plots would seriously affect your property with
                      either noise or dust pollution or both, then we will use our reasonable endeavours to offer you
                      an alternative from the Sojourn Cabins portfolio only. Where works or public works occur at short
                      notice or without notice, and which are outside of our control, we cannot be held liable for any
                      inconvenience to you, but we will ask the owners to compensate you, and if this is agreed, we
                      will pass this on to you on behalf of the property owner.
                    </p>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      New building work starting after publication of individual cabin descriptions may in some way
                      distort our description of the property we have considered peaceful or quiet. Building or road
                      works may be in progress nearby, a neighbour may start building a swimming pool or wall, or the
                      local water board may decide to drill for water in the vicinity. This work may start early in the
                      morning as it is local practice and can start at any time in the year. As it is not always
                      possible to gauge the extent of such works we regret we cannot advise you of the constantly
                      changing conditions. If within 7 days of the start of your holiday we become aware of such works
                      taking place on a plot immediately adjacent to your property (that is, an adjoining plot - not
                      across the road or merely nearby) that in our opinion could materially spoil your enjoyment of
                      your holiday we will advise you. You may then either a) cancel and receive a full refund for
                      accommodation and car hire if the latter is booked with ourselves or b) change your booking to
                      another available (subject to availability) cabin from Sojourn Cabins portfolio only for the same
                      period either paying the difference if it is more expensive or receiving a refund if it is
                      cheaper, or c) change your booking to another available cabin for a different period either
                      paying the difference if it is more expensive or receiving a refund if it is cheaper or d) leave
                      your reservation as it is and hope that there is not too much noise or dust to spoil your
                      holiday. If you choose option (d), to stay with the reservation, it is extremely unlikely that
                      after arrival we will be able to move you to any alternative accommodation if you suffer any
                      inconvenience as described above, nor will any claim for compensation be accepted for any loss of
                      enjoyment due to building or any other associated works within the vicinity of your holiday
                      cabin. You should note that we are not responsible for such work, are not able to stop such work
                      taking place nor control the noise level. Nor can we be responsible for any building works that
                      start during a holiday and under no circumstances will we pay any compensation at all in such
                      cases.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Law and Jurisdiction</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      This Agreement shall be governed and construed in all respects in accordance with the laws of
                      Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts and not
                      outside of the Ghanaian courts. This applies to consumer claims that are made outside of the
                      Ghanaian Courts and its jurisdiction.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Responsibility</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      By completing and returning the Booking Form, you and all members of your party acknowledge full
                      awareness of these Booking Terms &amp; Conditions and agree to accept and abide by the terms
                      stated.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Condition of Cabin on Checkout</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      On departure you should leave the cabin in a reasonably clean and tidy condition so that it can
                      be efficiently prepared for the next guests. If excess rubbish must be cleared or excessive
                      cleaning of the cabin is necessary following your stay, any charges will either be: (a) deducted
                      from your security deposit; or (b) invoiced to your postal address.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Pricing Errors</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Whilst we make every effort to ensure the accuracy of the pricing information provided,
                      regrettably errors may occasionally occur. When we become aware of any such error, we will
                      endeavour to notify you at the time of booking (if we are then aware of the mistake), within 7
                      days of the time of booking or as soon as reasonably possible. If a booking is already in place,
                      you will have the choice to continue with the chosen itinerary at the corrected price or amend
                      to a different holiday. We reserve the right to cancel the booking if you do not wish to accept
                      the price that applies to your holiday or any quoted alternatives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}