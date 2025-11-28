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
  image_url?: string | null;
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
  const [stage, setStage] = useState<'dates' | 'packages' | 'rooms' | 'details'>(
    'dates'
  );
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

        const pkgUrl = `${SUPABASE_URL}/rest/v1/packages?select=id,code,name,description,package_price,currency,nights,is_active,valid_from,valid_until,image_url&is_active=eq.true&order=name`;

        const pkgData = await fetchJSON<PackageRow[]>(pkgUrl);
        if (cancelled) return;
        if (!pkgData.length) {
          setPackages([]);
          setError('No packages are currently available.');
          return;
        }
        setPackages(pkgData);

        setStage('dates');
        setFilteredPackages([]);
        setAvailableRoomsByPackage({});
        setAvailableRoomsForSelected([]);

        const pkgIds = pkgData.map((p) => p.id);

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

  useEffect(() => {
    const pkg = packages.find((p) => p.id === selectedPackageId);
    const nightsVal = pkg?.nights && pkg.nights > 0 ? pkg.nights : 1;
    setCheckOut(addDaysISO(checkIn, nightsVal));
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

      const currency = selectedPackage.currency || 'GHS';

      const confirmationCode =
        'S' +
        Math.random().toString(36).slice(2, 6).toUpperCase() +
        Date.now().toString().slice(-4);

      const roomFromAvailable =
        availableRoomsForSelected.find((r) => r.id === selectedRoomId) ||
        (roomsByPackage[selectedPackage.id] || []).find(
          (r) => r.id === selectedRoomId
        ) ||
        null;

      const roomCode = roomFromAvailable?.code || '';
      const roomName = roomFromAvailable?.name || '';

      const reservationPayload = {
        confirmation_code: confirmationCode,
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
        code: reservation?.confirmation_code || confirmationCode,
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
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* subtle gradient glow in corner like widget card */}
        <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_55%)] opacity-70" />
        <div className="relative p-5 sm:p-7 md:p-8 space-y-5">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm ring-1 ring-slate-200/70 hover:text-slate-700 hover:bg-slate-50 transition"
          >
            ✕
          </button>

          {/* Header */}
          <header className="space-y-1 pr-10">
            <h2 className="text-[22px] md:text-[24px] font-semibold tracking-tight text-slate-900">
              Curated Stays &amp; Packages
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Choose your dates, then pick a package and cabin. Styling matches the
              main booking flow.
            </p>
          </header>

          {/* Status messages */}
          {loading && (
            <div className="text-xs md:text-sm text-slate-500">
              Loading packages…
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-xs md:text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs md:text-sm text-emerald-700 shadow-sm">
              {success}
            </div>
          )}

          {/* Main content card (matches widget sheet feel) */}
          {!loading && packages.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)] px-4 py-4 sm:px-5 sm:py-5 space-y-5">
              {/* STAGE 1: Date picker */}
              {stage === 'dates' && (
                <div className="space-y-4">
                  <p className="text-xs md:text-sm text-slate-500">
                    Pick your dates to see which packages and cabins are available.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
                        Check-in
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400/40 focus:outline-none"
                        value={checkIn}
                        min={todayISO}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
                        Check-out
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400/40 focus:outline-none"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={runAvailabilitySearch}
                        className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-900 shadow-[0_14px_30px_rgba(249,115,22,0.35)] hover:shadow-[0_18px_40px_rgba(249,115,22,0.45)] hover:from-orange-500 hover:to-orange-500 transition"
                      >
                        Check packages
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: Packages */}
              {stage === 'packages' && (
                <div className="space-y-4">
                  {filteredPackages.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs md:text-sm text-amber-800">
                      No packages are available for these dates. Please choose
                      different dates or make a custom booking.
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
                            className="text-left bg-white/95 border border-slate-200 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] hover:border-orange-400/80 transition flex flex-col h-full overflow-y-auto"
                          >
                            <div
                              className="h-48 w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
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
                              <div className="text-sm md:text-base font-semibold text-slate-900 mb-1">
                                {p.name}
                              </div>

                              {p.description && (
                                <p className="text-[11px] md:text-xs text-slate-600 mb-2 line-clamp-3">
                                  {p.description}
                                </p>
                              )}

                              {pkgExtras.length > 0 && (
                                <p className="text-[11px] text-slate-500 mb-3">
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
                                        {idx < arr.length - 1 && (
                                          <strong> · </strong>
                                        )}
                                      </span>
                                    ))}
                                </p>
                              )}

                              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <div className="text-xs md:text-sm">
                                  <div className="font-semibold text-slate-900">
                                    {p.currency || 'GHS'} {pkgTotal.toFixed(2)}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {nightsVal} night{nightsVal === 1 ? '' : 's'} •
                                    room + curated extras
                                  </div>
                                  {roomPart > 0 && (
                                    <div className="mt-1 text-[11px] text-slate-400" />
                                  )}
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-orange-500 to-orange-400 text-slate-900 shadow-sm uppercase tracking-[0.16em]">
                                  Select
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStage('dates')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline decoration-slate-300"
                  >
                    ← Back to dates
                  </button>
                </div>
              )}

              {/* STAGE 3: Rooms */}
              {stage === 'rooms' && selectedPackage && (
                <div className="space-y-4">
                  <p className="text-xs md:text-sm text-slate-500">
                    Choose a cabin for the{' '}
                    <span className="font-semibold text-slate-800">
                      {selectedPackage.name}
                    </span>{' '}
                    package.
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
                        className="text-left bg-white/95 border border-slate-200 rounded-2xl shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] hover:border-orange-400/80 transition flex flex-col h-full overflow-y-auto"
                      >
                        <div
                          className="h-48 w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
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
                          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-1">
                            {(r.code || '').toUpperCase()}
                          </div>
                          <div className="text-sm md:text-base font-semibold text-slate-900 mb-1">
                            {r.name}
                          </div>
                          <div className="mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                            Available for your selected dates.
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStage('packages')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline decoration-slate-300"
                  >
                    ← Back to packages
                  </button>
                </div>
              )}

              {/* STAGE 4: Details – styled to match booking widget guest modal */}
              {stage === 'details' &&
                selectedPackage &&
                selectedRoomId != null && (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Top row – package + room, same pill card vibe */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
                          Package
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm shadow-sm">
                          <div className="font-semibold text-slate-900">
                            {(selectedPackage.code || '').toUpperCase()} —{' '}
                            {selectedPackage.name}
                          </div>
                          {selectedPackage.description && (
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                              {selectedPackage.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">
                          Room type
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm shadow-sm">
                          {availableRoomsForSelected.find(
                            (r) => r.id === selectedRoomId
                          )?.name || 'Selected cabin'}
                        </div>
                      </div>
                    </div>

                    {/* Guest form fields in same 2-column layout as package/room */}
                    <div className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                            First name
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                            Last name
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                            Email address
                          </label>
                          <input
                            type="email"
                            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                            Phone number <span className="text-slate-400 font-normal normal-case">(optional)</span>
                          </label>
                          <input
                            type="tel"
                            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+233 XX XXX XXXX"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                            Adults
                          </label>
                          <input
                            type="number"
                            min={1}
                            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow"
                            value={adults}
                            onChange={(e) =>
                              setAdults(parseInt(e.target.value || '0', 10) || 0)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                            Children
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow"
                            value={children}
                            onChange={(e) =>
                              setChildren(
                                parseInt(e.target.value || '0', 10) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Full width fields */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                          Special requests <span className="text-slate-400 font-normal normal-case">(optional)</span>
                        </label>
                        <textarea
                          className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-shadow resize-none min-h-[96px]"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Any special requests or requirements..."
                        />
                      </div>

                      {/* Booking summary – moved below form fields */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 md:px-5 md:py-5 shadow-sm space-y-3 text-sm">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Booking summary
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Dates</span>
                            <span className="font-medium text-slate-900">
                              {checkIn} → {checkOut}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Room</span>
                            <span className="font-medium text-slate-900">
                              {availableRoomsForSelected.find(
                                (r) => r.id === selectedRoomId
                              )?.name || 'Selected cabin'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Nights</span>
                            <span className="font-medium text-slate-900">
                              {nights > 0
                                ? `${nights} night${nights === 1 ? '' : 's'}`
                                : '—'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Room subtotal
                            </span>
                            <span className="font-medium text-slate-900">
                              {selectedPackage.currency || 'GHS'}{' '}
                              {roomSubtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Extras</span>
                            <span className="font-medium text-slate-900">
                              {selectedPackage.currency || 'GHS'}{' '}
                              {extrasTotal.toFixed(2)}
                            </span>
                          </div>
                          {/* No discount for packages right now, so mimic widget with just total */}
                          <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200">
                            <span className="text-xs font-semibold text-slate-700">
                              Total to pay
                            </span>
                            <span className="font-semibold text-slate-900">
                              {selectedPackage.currency || 'GHS'}{' '}
                              {packagePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions – match guest modal footer behaviour */}
                    <div className="flex items-center justify-between pt-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setStage('rooms')}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline decoration-slate-300"
                      >
                        ← Back to cabins
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-900 shadow-[0_14px_30px_rgba(249,115,22,0.35)] hover:shadow-[0_18px_40px_rgba(249,115,22,0.45)] hover:from-orange-500 hover:to-orange-500 transition disabled:opacity-60"
                      >
                        {submitting ? 'Booking…' : 'Confirm booking'}
                      </button>
                    </div>
                  </form>
                )}
            </div>
          )}

          {/* Confirmation overlay (styled like widget "thanks" sheet) */}
          {confirmation && (
            <div
              className="fixed inset-0 z-[60] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-4"
              onClick={() => {
                setConfirmation(null);
                onClose();
              }}
            >
              <div
                className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 max-w-lg w-full rounded-3xl shadow-[0_22px_60px_rgba(15,23,42,0.25)] border border-slate-200/80 p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation(null);
                    onClose();
                  }}
                  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-sm ring-1 ring-slate-200/70 hover:text-slate-700 hover:bg-slate-50 transition"
                >
                  ×
                </button>

                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1">
                  Booking confirmed! 🎉
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  Thank you! Your reservation is confirmed.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 md:px-5 md:py-4 space-y-3 text-sm shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">
                      Confirmation code
                    </span>
                    <span className="font-semibold text-slate-900">
                      {confirmation.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Guest</span>
                    <span className="text-slate-900">
                      {confirmation.guestName || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Dates</span>
                    <span className="text-slate-900">
                      {confirmation.checkIn} → {confirmation.checkOut}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Room</span>
                    <span className="text-slate-900">
                      {confirmation.roomName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-600">Package</span>
                    <span className="text-slate-900">
                      {confirmation.packageName}
                    </span>
                  </div>
                  {confirmation.packageIncludes && (
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-600 mb-1">
                        Package includes
                      </span>
                      <ul className="text-slate-900 text-sm list-disc list-inside space-y-1">
                        {confirmation.packageIncludes
                          .split(', ')
                          .map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">
                      Total paid
                    </span>
                    <span className="font-semibold text-slate-900">
                      {confirmation.currency}{' '}
                      {confirmation.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs md:text-sm text-slate-500">
                  A confirmation email will be sent to you shortly.
                </p>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmation(null);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-900 shadow-[0_14px_30px_rgba(249,115,22,0.35)] hover:shadow-[0_18px_40px_rgba(249,115,22,0.45)] hover:from-orange-500 hover:to-orange-500 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}