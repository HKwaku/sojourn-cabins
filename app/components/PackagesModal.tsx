'use client';

import { useEffect, useMemo, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const HEADERS: HeadersInit = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

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
  image_url?: string | null;   // 👈 add this line
};



type RoomRow = {
  id: number;
  code: string | null;
  name: string | null;
  image_url?: string | null;
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
};

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
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

export default function PackagesModal({ isOpen, onClose }: Props) {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  // dates → filtered package tiles → available rooms → details form
  const [stage, setStage] = useState<'dates' | 'packages' | 'rooms' | 'details'>('dates');
  const [roomsByPackage, setRoomsByPackage] = useState<Record<number, RoomRow[]>>(
    {}
  );
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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState('');

  // Load packages / rooms / extras when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError(
        'Booking is temporarily unavailable. Missing Supabase configuration.'
      );
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // 1) Active packages
        const pkgUrl = `${SUPABASE_URL}/rest/v1/packages?select=id,code,name,description,package_price,currency,nights,is_active,valid_from,valid_until,image_url&is_active=eq.true&order=name`;

        const pkgData = await fetchJSON<PackageRow[]>(pkgUrl);
        if (cancelled) return;
        if (!pkgData.length) {
          setPackages([]);
          setError('No packages are currently available.');
          return;
        }
        setPackages(pkgData);

        // start each open of the modal from the date selection step
        setStage('dates');
        setFilteredPackages([]);
        setAvailableRoomsByPackage({});
        setAvailableRoomsForSelected([]);
        
        // ensure we start on the tile view every time modal opens      
        const pkgIds = pkgData.map((p) => p.id);

        // 2) Rooms for those packages
        const roomsUrl = `${SUPABASE_URL}/rest/v1/packages_rooms?select=package_id,room_type_id&package_id=in.(${pkgIds.join(
          ','
        )})`;
        const pkgRooms = await fetchJSON<
          { package_id: number; room_type_id: number }[]
        >(roomsUrl);

        const roomIds = Array.from(
          new Set(pkgRooms.map((r) => r.room_type_id).filter(Boolean))
        );

        let roomsById: Record<number, RoomRow> = {};
        if (roomIds.length) {
          const roomUrl = `${SUPABASE_URL}/rest/v1/room_types?select=id,code,name,image_url&id=in.(${roomIds.join(
            ','
          )})`;
          const rooms = await fetchJSON<RoomRow[]>(roomUrl);
          roomsById = Object.fromEntries(rooms.map((r) => [r.id, r]));
        }

        const roomsMap: Record<number, RoomRow[]> = {};
        pkgRooms.forEach((pr) => {
          const room = roomsById[pr.room_type_id];
          if (!room) return;
          if (!roomsMap[pr.package_id]) roomsMap[pr.package_id] = [];
          roomsMap[pr.package_id].push(room);
        });
        setRoomsByPackage(roomsMap);

        // 3) Extras for those packages
        const pkgExtrasUrl = `${SUPABASE_URL}/rest/v1/package_extras?select=package_id,extra_id,quantity,code&package_id=in.(${pkgIds.join(
          ','
        )})`;
        const pkgExtras = await fetchJSON<
          { package_id: number; extra_id: number; quantity: number | null; code: string | null }[]
        >(pkgExtrasUrl);

        const extraIds = Array.from(
          new Set(pkgExtras.map((px) => px.extra_id).filter(Boolean))
        );

        let extrasById: Record<number, ExtraRow> = {};
        if (extraIds.length) {
          const extrasUrl = `${SUPABASE_URL}/rest/v1/extras?select=id,name,price,currency,code&id=in.(${extraIds.join(
            ','
          )})`;
          const extras = await fetchJSON<ExtraRow[]>(extrasUrl);
          extrasById = Object.fromEntries(extras.map((e) => [e.id, e]));
        }

        const extrasMap: Record<
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

        pkgExtras.forEach((px) => {
          const ex = extrasById[px.extra_id];
          if (!ex) return;
          const arr = extrasMap[px.package_id] || [];
          arr.push({
            extra_id: px.extra_id,
            quantity: px.quantity || 1,
            code: px.code || ex.code || null,
            name: ex.name || null,
            price: ex.price || 0,
            currency: ex.currency || 'GHS',
          });
          extrasMap[px.package_id] = arr;
        });

        setExtrasByPackage(extrasMap);

        // Default selection (only used once a user chooses a package)
        setSelectedPackageId(null);
        setSelectedRoomId(null);
        

      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError('Unable to load packages at the moment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Keep check-out in sync with check-in + package.nights (or +1 if none)
  useEffect(() => {
    const pkg = packages.find((p) => p.id === selectedPackageId);
    const nights = pkg?.nights && pkg.nights > 0 ? pkg.nights : 1;
    setCheckOut(addDaysISO(checkIn, nights));
  }, [checkIn, selectedPackageId, packages]);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || null,
    [packages, selectedPackageId]
  );

  const packageExtras = useMemo(
    () => (selectedPackageId ? extrasByPackage[selectedPackageId] || [] : []),
    [extrasByPackage, selectedPackageId]
  );

  const nights = diffNights(checkIn, checkOut);

  const extrasTotal = packageExtras.reduce(
    (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
    0
  );
  const packagePrice = Number(selectedPackage?.package_price || 0);
  let roomSubtotal = packagePrice - extrasTotal;
  if (roomSubtotal < 0) roomSubtotal = 0;

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

    async function runAvailabilitySearch() {
    if (!checkIn || !checkOut) {
      setError('Please choose both check-in and check-out dates.');
      return;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) {
      setError('Check-out date must be after check-in.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 1) Filter packages by valid_from / valid_until
      const dateFiltered = packages.filter((p) => {
        if (p.valid_from && checkIn < p.valid_from) return false;
        if (p.valid_until && checkOut > p.valid_until) return false;
        return true;
      });

      if (!dateFiltered.length) {
        setFilteredPackages([]);
        setAvailableRoomsByPackage({});
        setStage('packages');
        return;
      }

      // 2) Collect all room_type_ids for these packages
      const allRoomIds = new Set<number>();
      dateFiltered.forEach((pkg) => {
        (roomsByPackage[pkg.id] || []).forEach((r) => {
          allRoomIds.add(r.id);
        });
      });

      if (!allRoomIds.size) {
        setFilteredPackages([]);
        setAvailableRoomsByPackage({});
        setStage('packages');
        return;
      }

      // 3) Fetch reservations for those room types
      const idList = Array.from(allRoomIds).join(',');
      const resUrl = `${SUPABASE_URL}/rest/v1/reservations?select=room_type_id,check_in,check_out,status&room_type_id=in.(${idList})`;
      const reservations = await fetchJSON<
        {
          room_type_id: number | null;
          check_in: string | null;
          check_out: string | null;
          status: string | null;
        }[]
      >(resUrl);

      const availableByPkg: Record<number, RoomRow[]> = {};
      const finalPackages: PackageRow[] = [];

      function roomIsFree(roomId: number): boolean {
        const relevant = reservations.filter(
          (r) =>
            r.room_type_id === roomId &&
            r.status !== 'cancelled' &&
            r.status !== 'no_show'
        );
        return !relevant.some((r) =>
          rangesOverlap(r.check_in, r.check_out, checkIn, checkOut)
        );
      }

      dateFiltered.forEach((pkg) => {
        const rooms = (roomsByPackage[pkg.id] || []).filter((r) =>
          roomIsFree(r.id)
        );
        if (rooms.length) {
          availableByPkg[pkg.id] = rooms;
          finalPackages.push(pkg);
        }
      });

      setFilteredPackages(finalPackages);
      setAvailableRoomsByPackage(availableByPkg);
      setStage('packages');
    } catch (err) {
      console.error(err);
      setError('Could not check availability right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPackage || !selectedRoomId) {
      setError('Please select a package and room type.');
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    const n = diffNights(checkIn, checkOut);
    if (n <= 0) {
      setError('Check-out date must be after check-in.');
      return;
    }

    const baseNights = selectedPackage.nights || 1;
    if (n % baseNights !== 0) {
      setError(
        `This package is valid only for multiples of ${baseNights} night(s). You selected ${n} night(s).`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // Availability check (simple client-side filter)
      const resUrl = `${SUPABASE_URL}/rest/v1/reservations?select=id,check_in,check_out,status,room_type_id,room_type_code`;
      const reservations = await fetchJSON<
        {
          id: number;
          check_in: string | null;
          check_out: string | null;
          status: string | null;
          room_type_id: number | null;
          room_type_code: string | null;
        }[]
      >(resUrl);

      const newStart = new Date(checkIn);
      const newEnd = new Date(checkOut);

      const relevant = reservations.filter((r) => {
        if (!r.check_in || !r.check_out) return false;
        if (r.status === 'cancelled' || r.status === 'no_show') return false;
        return r.room_type_id === selectedRoomId;
      });

      const hasOverlap = relevant.some((r) => {
        const existingStart = new Date(r.check_in!);
        const existingEnd = new Date(r.check_out!);
        if (
          Number.isNaN(existingStart.getTime()) ||
          Number.isNaN(existingEnd.getTime())
        ) {
          return false;
        }
        return existingStart < newEnd && existingEnd > newStart;
      });

      if (hasOverlap) {
        setError('This cabin is not available for the selected dates.');
        return;
      }

      // Insert reservation
      const currency = selectedPackage.currency || 'GHS';

      const confirmation =
        'S' +
        Math.random().toString(36).slice(2, 6).toUpperCase() +
        Date.now().toString().slice(-4);

            // Find the selected room so we can persist its code & name
      const roomFromAvailable =
        availableRoomsForSelected.find((r) => r.id === selectedRoomId) ||
        (roomsByPackage[selectedPackage.id] || []).find(
          (r) => r.id === selectedRoomId
        ) ||
        null;

      const roomCode = roomFromAvailable?.code || '';
      const roomName = roomFromAvailable?.name || '';


      const reservationPayload = {
        confirmation_code: confirmation,
        guest_first_name: firstName.trim() || null,
        guest_last_name: lastName.trim() || null,
        guest_email: email.trim() || null,
        guest_phone: phone.trim() || null,
        check_in: checkIn,
        check_out: checkOut,
        nights: n,
        adults,
        children,
        status: 'confirmed',
        payment_status: 'unpaid',
        currency,
        room_type_id: selectedRoomId,
        room_type_code: roomCode,
        room_name: roomName,
        package_id: selectedPackage.id,
        room_subtotal: roomSubtotal,
        extras_total: extrasTotal,
        discount_amount: 0,
        total: packagePrice,
        notes: notes || null,
      };

      const [reservation] = await postJSON<any[]>(
        'reservations',
        reservationPayload
      );

            if (reservation && packageExtras.length) {
        const extrasRows = packageExtras.map((e) => ({
          reservation_id: reservation.id,
          extra_id: e.extra_id,
          extra_code: e.code || null,
          extra_name: e.name || null,
          price: e.price || 0,
          quantity: e.quantity || 1,
          subtotal: (e.price || 0) * (e.quantity || 1),
        }));
        await postJSON('reservation_extras', extrasRows);
      }

      
      const packageIncludesText =
        packageExtras.length > 0
          ? packageExtras
              .map((e) =>
                `${e.quantity && e.quantity > 1 ? `${e.quantity}× ` : ''}${
                  e.name || e.code || ''
                }`.trim()
              )
              .filter(Boolean)
              .join(', ')
          : null;

      setConfirmation({
        code: reservation?.confirmation_code || confirmation,
        guestName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        roomName:
          reservation?.room_name || roomFromAvailable?.name || 'Selected cabin',
        total: reservation?.total ?? packagePrice,
        currency,
        checkIn,
        checkOut,
        packageName: selectedPackage.name || '',
        packageIncludes: packageIncludesText,
      });

      setSuccess(null);

    } catch (err: any) {
      console.error(err);
      setError('There was a problem completing your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
    <div
      className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-6 md:p-8 relative max-h-[calc(100vh-3rem)] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl md:text-3xl font-serif mb-2">
          Curated Stays & Packages
        </h2>
        <p className="text-sm md:text-base text-gray-600 mb-6">
          Select a package to see which cabins are available for your dates
          
        </p>

        {loading && (
          <div className="text-sm text-gray-500">Loading packages…</div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

                {!loading && packages.length > 0 && (
          <>
            {/* STAGE 1: Date picker + "Check packages" */}
            {stage === 'dates' && (
              <div className="space-y-5">
                <p className="text-sm text-gray-600">
                  Choose your dates to see which packages and cabins are available.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={checkIn}
                      min={todayISO}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={runAvailabilitySearch}
                      className="w-full px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900"
                    >
                      Check packages
                    </button>
                  </div>
                </div>
              </div>
            )}

                        {/* STAGE 2: Available package tiles */}
            {stage === 'packages' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  
                </p>

                {filteredPackages.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    No packages are available for these dates. Please choose different
                    dates or make a custom booking.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredPackages.map((p) => {
                      const pkgExtras = extrasByPackage[p.id] || [];
                      const extrasTotalForPkg = pkgExtras.reduce(
                        (sum, e) => sum + (e.price || 0) * (e.quantity || 1),
                        0
                      );
                      const pkgTotal = Number(p.package_price || 0);
                      const roomPart = Math.max(pkgTotal - extrasTotalForPkg, 0);
                      const nightsVal = p.nights && p.nights > 0 ? p.nights : 1;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPackageId(p.id);
                            const rooms = availableRoomsByPackage[p.id] || [];
                            setAvailableRoomsForSelected(rooms);
                            setStage('rooms');
                            setError(null);
                            setSuccess(null);
                          }}
                          className="text-left bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-300 transition flex flex-col h-full overflow-hidden"
                        >
                          <div
                            className="h-36 w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
                            style={
                              p.image_url
                                ? {
                                    backgroundImage: `url(${p.image_url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                  }
                                : undefined
                            }
                          />
                          <div className="p-4 flex flex-col flex-1">
                            <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                              {p.name}
                            </div>

                            {p.description && (
                              <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-3">
                                {p.description}
                              </p>
                            )}

                            {pkgExtras.length > 0 && (
                              <p className="text-[11px] text-gray-500 mb-3">
                                <span className="font-medium">Includes:</span>{' '}
                                {pkgExtras
                                  .map((e) =>
                                    `${
                                      e.quantity && e.quantity > 1
                                        ? `${e.quantity}× `
                                        : ''
                                    }${e.name || e.code || ''}`.trim()
                                  )
                                  .filter(Boolean)
                                  .map((item, idx, arr) => (
                                    <span key={idx}>
                                      {item}
                                      {idx < arr.length - 1 && <strong> | </strong>}
                                    </span>
                                  ))}
                              </p>
                            )}

                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                              <div className="text-sm">
                                <div className="font-semibold text-gray-900">
                                  {p.currency || 'GHS'} {pkgTotal.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {nightsVal} night{nightsVal === 1 ? '' : 's'} •
                                  room + curated extras
                                </div>
                                {roomPart > 0 && (
                                  <div className="mt-1 text-[11px] text-gray-400">
                                </div>
                                )}
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                                Select
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* back to date selection */}
                <button
                  type="button"
                  onClick={() => setStage('dates')}
                  className="text-xs text-gray-600 underline decoration-gray-300 hover:text-gray-900"
                >
                  ← Back to dates
                </button>
              </div>
            )}
            

            {/* STAGE 3: Available rooms for chosen package */}
            {stage === 'rooms' && selectedPackage && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose a cabin for the <span className="font-semibold">{selectedPackage.name}</span> package.
                </p>

                <div className="flex flex-col gap-4">
                  {availableRoomsForSelected.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoomId(r.id);
                        setStage('details');
                      }}
                      className="text-left bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-300 transition flex flex-col h-full overflow-hidden"
                    >
                      <div
                      className="h-24 w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
                      style={
                        r.image_url
                          ? {
                              backgroundImage: `url(${r.image_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                            }
                          : undefined
                      }
                    />

                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 mb-1">
                          {(r.code || '').toUpperCase()}
                        </div>
                        <div className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                          {r.name}
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 text-xs text-gray-500">
                          Available for your selected dates.
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStage('packages')}
                  className="text-xs text-gray-600 underline decoration-gray-300 hover:text-gray-900"
                >
                  ← Back to packages
                </button>
              </div>
            )}

            {/* STAGE 4: Details form */}
            {stage === 'details' && selectedPackage && selectedRoomId != null && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Summary row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      <div className="font-semibold text-gray-900">
                        {(selectedPackage.code || '').toUpperCase()} — {selectedPackage.name}
                      </div>
                      {selectedPackage.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {selectedPackage.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room type
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                      {availableRoomsForSelected.find((r) => r.id === selectedRoomId)?.name ||
                        'Selected cabin'}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                      {checkIn}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                      {checkOut}
                    </div>
                  </div>
                  <div className="flex items-end">
                    {/* keep your existing price summary card here unchanged */}
                    <div className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      <div className="font-semibold text-gray-900 text-sm">
                        {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : '—'}
                      </div>
                      <div>
                        Room: {selectedPackage.currency || 'GHS'} {roomSubtotal.toFixed(2)}
                      </div>
                      <div>
                        Extras: {selectedPackage.currency || 'GHS'} {extrasTotal.toFixed(2)}
                      </div>
                      <div className="mt-1 border-t border-gray-200 pt-1 text-gray-900 font-semibold">
                        Total: {selectedPackage.currency || 'GHS'} {packagePrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>


                {/* Guest details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Guests + notes */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adults
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Children
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={children}
                      onChange={(e) =>
                        setChildren(parseInt(e.target.value || '0', 10) || 0)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special requests
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[72px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Dietary needs, late check-in, etc."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStage('rooms')}
                    className="text-xs text-gray-600 underline decoration-gray-300 hover:text-gray-900"
                  >
                    ← Back to cabins
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
                  >
                    {submitting ? 'Booking…' : 'Confirm booking'}
                  </button>
                </div>
                        </form>
                      )}
          </>
        )}

                    {confirmation && (
                      <div
                        className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4"
                        onClick={() => {
                          setConfirmation(null);
                          onClose();
                        }}
                      >
                        <div
                          className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 md:p-8 relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmation(null);
                              onClose();
                            }}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>

                          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                            Booking confirmed! 🎉
                          </h2>
                          <p className="text-sm text-gray-600 mb-5">
                            Thank you! Your reservation is confirmed.
                          </p>

                          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 md:px-5 md:py-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Confirmation code
                              </span>
                              <span className="font-semibold text-gray-900">
                                {confirmation.code}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Guest</span>
                              <span className="text-gray-900">
                                {confirmation.guestName || '—'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Dates</span>
                              <span className="text-gray-900">
                                {confirmation.checkIn} → {confirmation.checkOut}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Room</span>
                              <span className="text-gray-900">
                                {confirmation.roomName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Package</span>
                              <span className="text-gray-900">
                                {confirmation.packageName}
                              </span>
                            </div>
                            {confirmation.packageIncludes && (
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-600 mb-1">
                                  Package includes
                                </span>
                                <ul className="text-gray-900 text-sm list-disc list-inside space-y-1">
                                  {confirmation.packageIncludes.split(', ').map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                              <span className="font-semibold text-gray-800">
                                Total paid
                              </span>
                              <span className="font-semibold text-gray-900">
                                {confirmation.currency}{' '}
                                {confirmation.total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <p className="mt-4 text-xs md:text-sm text-gray-500">
                            A confirmation email will be sent to you shortly.
                          </p>

                          <div className="mt-5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmation(null);
                                onClose();
                              }}
                              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
    </div>
  );
}