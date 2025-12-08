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
  { code: '+233', label: '🇬🇭 Ghana (+233)' },
  { code: '+234', label: '🇳🇬 Nigeria (+234)' },
  { code: '+27', label: '🇿🇦 South Africa (+27)' },
  { code: '+254', label: '🇰🇪 Kenya (+254)' },
  { code: '+44', label: '🇬🇧 United Kingdom (+44)' },
  { code: '+1', label: '🇺🇸 United States (+1)' },
  { code: '+1', label: '🇨🇦 Canada (+1)' },
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+49', label: '🇩🇪 Germany (+49)' },
  { code: '+34', label: '🇪🇸 Spain (+34)' },
  { code: '+39', label: '🇮🇹 Italy (+39)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+61', label: '🇦🇺 Australia (+61)' },
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

function addDaysISO(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
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

  const todayISO = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const [checkIn, setCheckIn] = useState<string>(todayISO);
  const [checkOut, setCheckOut] = useState<string>(addDaysISO(todayISO, 1));

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+233');
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

        // ---- Compute "Available from" date per package (same logic as featured cards) ----
        const todayISO = new Date().toISOString().slice(0, 10);
        const reservationsByRoom: Record<
          number,
          { room_type_id: number | null; check_in: string | null; check_out: string | null; status: string | null }[]
        > = {};

        if (roomIdSet.size) {
          const roomIds = Array.from(roomIdSet);
          const resUrl =
            `${SUPABASE_URL}/rest/v1/reservations` +
            `?select=room_type_id,check_in,check_out,status` +
            `&room_type_id=in.(${roomIds.join(',')})` +
            `&check_out=gte.${todayISO}`;

          const resvs = await fetchJSON<
            { room_type_id: number | null; check_in: string | null; check_out: string | null; status: string | null }[]
          >(resUrl);

          (resvs || []).forEach((r) => {
            if (!r.room_type_id) return;
            if (r.status === 'cancelled' || r.status === 'no_show') return;
            if (!reservationsByRoom[r.room_type_id]) {
              reservationsByRoom[r.room_type_id] = [];
            }
            reservationsByRoom[r.room_type_id].push(r);
          });
        }

        const horizonDays = 365;
        const nextAvailMap: Record<number, string | null> = {};

        pkgs.forEach((pkg) => {
          const nights = pkg.nights && pkg.nights > 0 ? pkg.nights : 1;
          const roomIdsForPkg = roomIdsByPkg[pkg.id] || [];
          let nextAvailable: string | null = null;

          if (roomIdsForPkg.length) {
            // Start from the later of today or the package's valid_from
            const startFrom =
              pkg.valid_from && pkg.valid_from > todayISO ? pkg.valid_from : todayISO;

            for (let offset = 0; offset < horizonDays; offset++) {
              const ci = addDaysISO(startFrom, offset);
              const co = addDaysISO(ci, nights);

              // Respect package validity end
              if (pkg.valid_until && co > pkg.valid_until) break;

              let hasFreeRoom = false;

              for (const roomId of roomIdsForPkg) {
                const resvsForRoom = reservationsByRoom[roomId] || [];
                const hasOverlap = resvsForRoom.some((r) =>
                  rangesOverlap(r.check_in, r.check_out, ci, co)
                );
                if (!hasOverlap) {
                  hasFreeRoom = true;
                  break;
                }
              }

              if (hasFreeRoom) {
                nextAvailable = ci;
                break;
              }
            }
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

        const horizonStartISO = today.toISOString().slice(0, 10);
        const horizonEndISO = horizonEnd.toISOString().slice(0, 10);

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
            set.add(cur.toISOString().slice(0, 10));
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
            occupancy[key]?.add(b.blocked_date);
          });
        }

        const disabled: string[] = [];

        // 3) For each potential check-in date in the horizon,
        //    disable if *no* room is free for the whole package stay.
        const ciCursor = new Date(today);
        while (ciCursor <= horizonEnd) {
          const ciStr = ciCursor.toISOString().slice(0, 10);

          // Always enforce package validity on check-in
          if (pkg.valid_from && ciStr < pkg.valid_from) {
            disabled.push(ciStr);
            ciCursor.setDate(ciCursor.getDate() + 1);
            continue;
          }
          if (pkg.valid_until && ciStr > pkg.valid_until) {
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
              const dStr = d.toISOString().slice(0, 10);
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

        const horizonStartISO = ciDate.toISOString().slice(0, 10);
        const horizonEndISO = horizonEnd.toISOString().slice(0, 10);

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
            set.add(cur.toISOString().slice(0, 10));
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
            occupancy[key]?.add(b.blocked_date);
          });
        }

        const invalid: string[] = [];

        // 3) For each possible CHECK-OUT date after min nights,
        //    mark it invalid if no room can host [checkIn, checkout)
        const minCoDate = new Date(ciDate);
        minCoDate.setDate(minCoDate.getDate() + minNights);

        const coCursor = new Date(minCoDate);
        while (coCursor <= horizonEnd) {
          const coStr = coCursor.toISOString().slice(0, 10);

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
              const dStr = d.toISOString().slice(0, 10);
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
    // Generate a confirmation code
    const confirmCode =
      'BK' +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');

    // --- compute extras + room subtotal ---
    const pkgExtras = extrasByPackage[selectedPackageId] ?? [];
    const extras_total = pkgExtras.reduce(
      (sum, ex) => sum + (ex.price ?? 0) * (ex.quantity ?? 1),
      0
    );
    const room_subtotal = (pkg.package_price ?? 0) - extras_total;

    const resPayload = {
      confirmation_code: confirmCode,
      room_type_id: selectedRoomId,
      room_type_code: room.code ?? '',
      room_name: room.name ?? 'Cabin',

      check_in: checkIn,
      check_out: checkOut,
      nights,
      adults,
      children: 0,

      // --- TOTAL BREAKDOWN ---
      room_subtotal,
      extras_total,
      discount_amount: 0,
      total: pkg.package_price ?? 0,
      currency: pkg.currency ?? 'GBP',

      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_email: email,
      guest_phone: `${countryCode}${phone}`,
      country_code: countryCode,

      status: 'pending',
      notes,

      package_id: selectedPackageId,
      package_code: pkg.code ?? null,
      package_name: pkg.name ?? null,
    };

    const inserted = await postJSON<any[]>('reservations', resPayload);
    const reservationId = inserted[0]?.id;
    if (!reservationId) throw new Error('No reservation ID returned.');

    // ---- INSERT INCLUDED PACKAGE EXTRAS (ONCE) ----
    if (pkgExtras.length > 0) {
      const extrasRows = pkgExtras.map((ex) => ({
        reservation_id: reservationId,
        extra_id: ex.extra_id,
        extra_code: ex.code,
        extra_name: ex.name,
        price: ex.price,
        quantity: ex.quantity,
        subtotal: ex.price * ex.quantity,
      }));

      try {
        await postJSON<any[]>('reservation_extras', extrasRows);
      } catch (err) {
        console.error('Failed to insert reservation_extras:', err);
      }
    }

    // Send confirmation email
    try {
      // Get package extras for the email
      const pkgExtras = extrasByPackage[selectedPackageId] ?? [];
      const extrasForEmail = pkgExtras.map(ex => ({
        name: ex.name,
        price: ex.price,
        qty: ex.quantity || 1
      }));

      const emailResponse = await fetch('/api/booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking: {
            ...inserted[0],
            rooms: [{
              room_name: room.name,
              extras: extrasForEmail
            }]
          }
        }),
      });
      
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Email API error:', errorText);
      }
    } catch (emailErr) {
      console.error('Failed to send booking email:', emailErr);
    }

    setConfirmation({
      code: inserted[0]?.confirmation_code ?? confirmCode,
      guestName: `${firstName} ${lastName}`,
      roomName: room.name ?? 'Room',
      total,
      currency: pkg.currency ?? 'GHS',
      checkIn,
      checkOut,
      packageName: pkg.name ?? 'Package',
      packageIncludes: pkg.description,
      packageExtras: extrasByPackage[pkg.id] ?? [],
      packageNights: pkg.nights ?? 1,
    });

    setSuccess('Reservation created successfully!');
  } catch (err: any) {
    setError(err.message || 'Failed to create reservation.');
  } finally {
    setSubmitting(false);
  }
}

  function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

    // 3) Capacity / blocked-dates for CHECK-IN only
    if (pickerId !== 'co' && disabled.indexOf(dateStr) !== -1) {
      return true;
    }

    // 4) For CHECK-OUT, block dates where no room can host the full stay
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
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg.id)}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col border border-stone-100 cursor-pointer"
                      >
                        {/* Package Image */}
                        {pkg.image_url && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={pkg.image_url}
                              alt={pkg.name ?? ''}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

                          {/* NEW: Available from (same style as featured packages) */}
                          {nextAvailableByPackage[pkg.id] && (
                            <>
                              <div className="flex items-center gap-2 text-sm mb-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-stone-600">
                                  Available from{' '}
                                  <span className="font-medium text-stone-900">
                                    {formatDate(nextAvailableByPackage[pkg.id] as string)}
                                  </span>
                                </span>
                              </div>
                              <div className="h-px bg-stone-200 mb-4" />
                            </>
                          )}

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Select Button */}
                          <button
                            type="button"
                            className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm tracking-wide font-medium hover:bg-stone-800 active:scale-[0.98] transition-all duration-300"
                          >
                            Select Package
                          </button>
                        </div>
                      </div>
                    ))}
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
                        value={checkIn}
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
                        value={checkOut}
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
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition bg-white"
                        >
                          {COUNTRY_OPTIONS.map((opt) => (
                            <option key={opt.code + opt.label} value={opt.code}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
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
                                    <span className="text-orange-500">✓</span>
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
                            {selectedPkg?.currency} {total.toFixed(2)}
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
                      {confirmation.currency} {confirmation.total.toFixed(2)}
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
                      These Booking Terms & Conditions and the General Booking Information contained on our web
                      site will form the basis of your agreement with Sojourn Cabins ("the Company"). They apply
                      only to holiday arrangements which you book with us and which we agree to make, provide or
                      perform as applicable as part of our agreement with you and no other third party. This
                      Agreement shall be governed and construed in all respects in accordance with the laws of
                      Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Contract</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      A contract only exists between Sojourn Cabins ("we/our/us") and the "clients" from the time
                      a Confirmation Invoice is dispatched / received and a payment must be made by the available
                      means on our payment portal.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Payment</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Full payment is required at the time of booking to confirm your reservation.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Cancellation Policy</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Cancellations made more than 30 days before check-in will receive a full refund minus a 10% processing fee.
                      Cancellations made 15-30 days before check-in will receive a 50% refund. Cancellations made less than 15 days
                      before check-in are non-refundable.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Check-in and Check-out</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Check-in time is 3:00 PM and check-out time is 11:00 AM. Early check-in or late check-out may be arranged
                      subject to availability and additional charges.
                    </p>

                    <h2 className="text-2xl font-serif font-light mt-8 mb-6 pb-4 border-b border-slate-200">Guest Responsibilities</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Guests are responsible for any damage to the property beyond normal wear and tear. Guests must comply with
                      all house rules and local regulations.
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