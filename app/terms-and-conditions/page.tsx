import Image from 'next/image'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/80"></p>
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-white/80"></p>
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight">Terms & Conditions</h1>
          <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before booking your stay
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              These Booking Terms &amp; Conditions and the General Booking Information contained on our web
              site will form the basis of your agreement with Sojourn Cabins ("the Company"). They apply
              only to holiday arrangements which you book with us and which we agree to make, provide or
              perform as applicable as part of our agreement with you and no other third party. This
              Agreement shall be governed and construed in all respects in accordance with the laws of
              Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts.
            </p>
          </div>

          {/* Contract */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Contract</h2>
            <p className="text-gray-600 leading-relaxed">
              A contract only exists between Sojourn Cabins ("we/our/us") and the "clients" from the time
              a Confirmation Invoice is dispatched / received and a payment must be made by the available
              means on our payment portal.
            </p>
          </div>

          {/* Booking Form */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Booking Form</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To make a booking with Sojourn Cabins a Booking Form will need to be completed accurately at{' '}
              <a href="https://sojourngh.com" target="_blank" rel="noreferrer" className="text-black font-medium hover:underline">
                sojourngh.com
              </a> and submitted.
              In the event a booking is made without completing a Booking Form, for instance a telephone
              booking, it is a condition that the information is accurately given. A telephone booking is a
              contract between us and the "clients" from the time a Confirmation/Invoice is dispatched when
              Credit Card / Debit details will be required. We require full payment before a booking will be
              completed. Until that time no contract or agreement will be considered to exist between us. On
              all bookings a damage deposit is required.
            </p>
          </div>

          {/* Party Leader and Group Composition */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Party Leader and Group Composition</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Party Leader is the person or agency who holds the booking, to whom all correspondence and
              invoices are addressed and who is responsible for the rental. Spouses' names are not considered
              interchangeable. Accommodation is provided only for the number of guests shown on the booking
              form.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Any additional persons wishing to book are required to notify us, as soon as possible and make
              confirmation in writing with any payment due immediately, unless we advise otherwise, but no
              later than 8 working days before departure or we reserve the right to refuse any such persons
              and may cancel the booking.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              No persons other than those stated on the Booking Form or accepted at such later date by
              Sojourn Cabins as additional persons shall be entitled to utilise and have the benefit of the
              accommodation and facilities of the property. The number of people staying in the cabin must
              not exceed the maximum number as shown in our website. Sojourn Cabins will ask any person to
              leave the assigned cabin in a case of non-compliance. Subletting, sharing or assigning the
              accommodation is prohibited.
            </p>
            <p className="text-gray-600 leading-relaxed">
              In the event that a person not named on the Booking Form or accepted as an additional person is
              deemed by us as agents as utilising the accommodation and facilities, we reserve the right to
              raise an additional charge for such accommodation etc, which shall be the joint and several
              liability of the clients. Additionally, should any activity or large gathering of people other
              than those noted on our invoice take place (e.g. party, wedding reception) we must be informed
              about it at the time of booking or through any of our Representatives beforehand. You will be
              charged an extra cost for cleaning / maid service / chef surcharge and a further security
              deposit may apply. Our cabins are let for holiday purposes only and commercial activities may
              only be carried out with our prior knowledge and or written approval on our invoice. This extra
              charge varies depending on the property and can be deducted from your credit or debit card
              without further notice.
            </p>
          </div>

          {/* Rental Period */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Rental Period</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All rental periods are indicated on your final invoice. Prices shown on our website refer to
              one night rental period. We do not accept bookings that go beyond 7 days at a time. The rental
              charge includes: the cabin for the rental period; a walking tour of Anomabo; a change of bed
              linens, bath towels; house wares such as linens, cooking utensils and china; electricity; water
              and hot water from taps; garden and pool maintenance; all local taxes.
            </p>
            <p className="text-gray-600 leading-relaxed">
              It does not include: outgoing telephone calls; Extra Services as requested; eating; chef
              services; repairs for damages to the property caused by your party; food; travel; car rental;
              transfers and travel insurance; staff gratuities.
            </p>
          </div>

          {/* Methods of Payment */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Methods of Payment</h2>
            <p className="text-gray-600 leading-relaxed">
              Payments can be made by: debit/credit card, or mobile money transfer via our booking website.
              All prices are in USD and payments have to be received in USD or GHS equivalent. If you wish to
              make payments in GHS, the{' '}
              <a href="https://www.bog.gov.gh" target="_blank" rel="noreferrer" className="text-black font-medium hover:underline">
                Bank of Ghana Official Daily Interbank FX Rates
              </a>{' '}
              will apply.
            </p>
          </div>

          {/* Price Guarantee */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Price Guarantee</h2>
            <p className="text-gray-600 leading-relaxed">
              Once you have made a booking and made all relevant payments, paid a deposit, we guarantee that
              the cost of your holiday will not change, no matter what happens to exchange rates or aviation
              fuel costs. The only exception is Government imposed cost increases such as VAT.
            </p>
          </div>

          {/* Holiday Pack */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Holiday Pack</h2>
            <p className="text-gray-600 leading-relaxed">
              The Holiday Pack includes all vouchers, list of Extra Services requested, driving directions,
              contact names and telephone numbers, useful information. The Holiday Pack will be provided once
              the fully completed Booking Form and the total Invoice Price have been received. The Holiday
              Pack will not be issued if essential information, including group composition, is missing in the
              Booking Form. Errors or omissions in the Holiday Pack must be noted and conveyed to us
              immediately.
            </p>
          </div>

          {/* Information Booklet */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Information Booklet</h2>
            <p className="text-gray-600 leading-relaxed">
              Please note that the information contained in our Information Booklet is to be considered only
              as an indication. The information contained in the Information Booklet was accurate at the time
              of publication and made in good faith. Please check the Invoice and our website as changes might
              occur and updated information are posted on our website.
            </p>
          </div>

          {/* Payments */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Payments</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All bookings must be paid in full. Sojourn Cabins reserves the right to refuse or terminate any
              booking where the client has not complied with the payment terms specified. If your bank's
              country of issue is not within Ghana, please allow at least 5 to 7 days for final payment
              clearance. It is the responsibility of the client to ensure that all foreign exchange and bank
              transfer fees are paid to ensure the amounts due are received in full. We advise, particularly
              for those booking from overseas to phone your credit / debit card company / bank prior to
              attempting to make a booking so they are aware you are going to be making a payment to Sojourn
              Cabins. This will eliminate the possibility of your card being rejected on the grounds of fraud
              protection.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cancellation by Sojourn Cabins: we reserve the right to cancel your booking if outstanding
              payments are not received on or before due dates specified on your booking invoice. Where
              cancellation is required for this reason, all monies already paid less any bank charges and
              administration costs of GHS 50 or equivalent in USD will be refunded to you. Should you wish to
              make alternative payment arrangements, it is your responsibility to contact us immediately to
              discuss options. We reserve the right in our absolute discretion to refuse a booking without
              giving reasons.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Full Payment date 56 days before departure: The outstanding balance is due 56 days before
              departure unless otherwise agreed. If your booking is made within 56 days of departure, the
              total price becomes due at the time of booking. We must receive a cleared payment by the due
              date stated on the invoice. If we do not receive this payment in time, we reserve the right to
              cancel your booking and retain your deposit.
            </p>
          </div>

          {/* Changes by You (Client) */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Changes by You (Client)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Change of dates and cabin size: if you wish to change any part of your booking, you must advise
              us of any such changes by written notice. We will endeavour to meet reasonable requests for
              changes, subject to availability, but cannot guarantee to do so. Where it is possible to make
              changes, we may charge a £50 administration fee unless such changes are outside your control (in
              which case no fee will be charged). Please note that we are unable to make any changes to
              bookings within 30 days of departure. We cannot guarantee to make any changes to bookings within
              56 days of departure and may charge you for any losses we incur in making changes at that time.
              If the requested change means that your payment(s) increase, we will advise you of the increase.
              If the requested change means that the total holiday price is reduced, we are not obliged to
              refund the difference, but shall use our discretion.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Change of party leader or composition: if you wish to transfer your confirmed booking to another
              person, this can be done provided that we are notified, the full payment is received and an
              administration charge of £100 is paid. The transferee must provide the information we require
              and satisfy all the requirements set out in these terms. Both transferor and transferee will be
              jointly and severally liable for the holiday price and additional charges which will be due at
              the time of transfer.
            </p>
          </div>

          {/* Cancellation by You (Client) */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Cancellation by You (Client)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you want to cancel your booking, then you or the party leader must contact us immediately in
              writing (by email or by recorded delivery letter) stating the reason(s). If you do cancel your
              booking, the following cancellation charges shall apply:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
              <ul className="space-y-3">
                <li className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">More than 56 days before departure</span>
                  <span className="font-medium text-gray-900">Loss of deposit</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">42 to 56 days before departure</span>
                  <span className="font-medium text-gray-900">60% of total price</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">28 to 41 days before departure</span>
                  <span className="font-medium text-gray-900">80% of total price</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="text-gray-600">Less than 28 days before departure</span>
                  <span className="font-medium text-gray-900">100% of total price</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-600 leading-relaxed">
              If only some members of your group cancel but others decide to continue, no refund will be made
              for those who cancel but the holiday will continue for the remaining guests. If one of your
              party is prevented from travelling due to death, injury, illness or other relevant reasons, a
              refund will not be issued but you may make a claim under your travel insurance policy. If
              clients reduce group numbers (which causes an increase in price per person) the remaining party
              must pay the price increase unless we are able to re-let the weeks to other clients. All
              cancellations must be confirmed in writing to the email address{' '}
              <a href="mailto:theteam@sojourngh.com" className="text-black font-medium hover:underline">
                theteam@sojourngh.com
              </a>.
            </p>
          </div>

          {/* Cancellation by Sojourn Cabins */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Cancellation by Sojourn Cabins</h2>
            <p className="text-gray-600 leading-relaxed">
              In the unlikely event we have to make a significant change or cancel your confirmed holiday
              booking, we will let you know as soon as possible and offer an alternative cabin or a full
              refund. Our liability in such circumstances is limited to a full refund of all monies paid.
            </p>
          </div>

          {/* Arrival & Departure Times */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Arrival & Departure Times</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Normal Check in time: Guests can arrive on the cabin at any time after 3pm on the arrival day.
              Check out must be by 11am on the departure day. If you arrive or depart early or late, you must
              make prior arrangements with us – additional charges may apply.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The cabins will have been thoroughly cleaned and prepared for your arrival, but if you find
              anything wrong when you arrive, please inform us immediately. We will use our reasonable
              endeavours to send someone out to remedy any problem as soon as possible. Please note that
              arrangements made in respect of departure may be changed at our discretion or by arrangement
              with us (e.g. you need to leave earlier or later than stated above).
            </p>
          </div>

          {/* Travel Insurance */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Travel Insurance</h2>
            <p className="text-gray-600 leading-relaxed">
              We strongly recommend that you arrange comprehensive holiday insurance which covers
              cancellation, medical expenses, repatriation and loss or damage to luggage and personal
              possessions prior to travelling. The minimum requirement is that you have a policy covering
              cancellation and medical expenses and repatriation in case of injury or illness. Any decision
              not to purchase insurance remains at your own discretion and at your own risk. We shall not be
              liable for any costs, losses or expenses incurred by you which could have been avoided had you
              taken out appropriate insurance.
            </p>
          </div>

          {/* Your Safety and Security */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Your Safety and Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Sojourn Cabins offer the best value and service for your accommodation and hope that your stay
              with us is pleasant, safe and trouble free. Please be aware that standards of accommodation and
              local safety, hygiene and security standards may differ from those you are accustomed to at home
              in your own country.
            </p>
            <p className="text-gray-600 leading-relaxed">
              It remains your responsibility to take all sensible precautions throughout your stay. You are
              responsible for the safety and behaviour of all members of your party. Our properties are not
              suitable for people with reduced mobility. You must ensure that you and your party arrive in a
              fit and sober state when taking possession of your accommodation. Use all electrical equipment
              with care and caution; report any faulty equipment and do not attempt repairs yourself. Follow
              all instructions displayed at the properties and in the information packs. Make sure children
              are supervised at all times and take particular care near swimming pools and the beach. Do not
              allow children to go to the beach unsupervised or swim in the sea.
            </p>
          </div>

          {/* Special Requests */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Special Requests</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have a special request, such as an anniversary cake, please let us know at the time of
              booking or when you submit the booking form, and we will note your requirement and inform the
              owner or property agent. We cannot guarantee that such requests will be met but we will do our
              best to accommodate them where possible. Any costs incurred for the provision of special
              requests will be notified to you in advance and confirmed on your invoice. Please note that such
              requests do not constitute any part of our agreement with you unless we actually confirm to you
              that we can fulfil the request and accept the relevant cost(s).
            </p>
          </div>

          {/* Security/Damage Deposits */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Security/Damage Deposits</h2>
            <p className="text-gray-600 leading-relaxed">
              Most cabin owners ask that you agree to a "Security Deposit" which is held to cover any loss or
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
          </div>

          {/* Complaints and Correspondence */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Complaints and Correspondence</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We hope that you enjoy your holiday and the services of Sojourn Cabins, but if you have any
              complaints, we want to rectify them as quickly as possible. It is our intention that any
              complaint is resolved quickly and to your satisfaction. Should you have any complaints / issues
              with your accommodation upon your arrival you must give Sojourn Cabins a reasonable amount of
              time to rectify / resolve any such issues. Should any clients of Sojourn Cabins vacate said
              property before Sojourn Cabins has had time to rectify any issues / complaints we will not be
              responsible for any costs of relocation or compensation.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              In the unlikely event that you are still dissatisfied with any part of our services, our office
              team will ask you to record the details by way of photographs and forward these to our Ghana
              office by email or recorded delivery within 12 days of the complaint or latest, the return date
              of your holiday with us. Failure to give written notification sent by email / recorded delivery
              within 12 days of your complaint or latest from the return date of your holiday shall result in
              our not being liable for any loss or compensation whatsoever or howsoever arising. Sojourn
              Cabins will respond to your complaint within 14 days of receiving your recorded letter as a
              management report may be required.
            </p>
            <p className="text-gray-600 leading-relaxed">
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
          </div>

          {/* Building Works */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Building Works</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              There may be new building/renovation work taking place close to your cabin. We take steps to try
              and monitor this and advise you if any building work is likely to affect your cabin. Should we
              consider that a neighbouring building plot or plots would seriously affect your property with
              either noise or dust pollution or both, then we will use our reasonable endeavours to offer you
              an alternative from the Sojourn Cabins portfolio only. Where works or public works occur at short
              notice or without notice, and which are outside of our control, we cannot be held liable for any
              inconvenience to you, but we will ask the owners to compensate you, and if this is agreed, we
              will pass this on to you on behalf of the property owner.
            </p>
            <p className="text-gray-600 leading-relaxed">
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
          </div>

          {/* Law and Jurisdiction */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Law and Jurisdiction</h2>
            <p className="text-gray-600 leading-relaxed">
              This Agreement shall be governed and construed in all respects in accordance with the laws of
              Ghana. The parties hereto submit to the exclusive jurisdiction of the Ghanaian Courts and not
              outside of the Ghanaian courts. This applies to consumer claims that are made outside of the
              Ghanaian Courts and its jurisdiction.
            </p>
          </div>

          {/* Responsibility */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Responsibility</h2>
            <p className="text-gray-600 leading-relaxed">
              By completing and returning the Booking Form, you and all members of your party acknowledge full
              awareness of these Booking Terms &amp; Conditions and agree to accept and abide by the terms
              stated.
            </p>
          </div>

          {/* Condition of Cabin on Checkout */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Condition of Cabin on Checkout</h2>
            <p className="text-gray-600 leading-relaxed">
              On departure you should leave the cabin in a reasonably clean and tidy condition so that it can
              be efficiently prepared for the next guests. If excess rubbish must be cleared or excessive
              cleaning of the cabin is necessary following your stay, any charges will either be: (a) deducted
              from your security deposit; or (b) invoiced to your postal address.
            </p>
          </div>

          {/* Pricing Errors */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6 pb-4 border-b border-gray-200">Pricing Errors</h2>
            <p className="text-gray-600 leading-relaxed">
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
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">Questions About Our Terms?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Our team is here to clarify any questions you may have about these terms and conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:theteam@sojourngh.com" 
              className="px-8 py-4 bg-white text-black text-sm tracking-wider uppercase hover:bg-gray-100 transition-colors duration-300"
            >
              Email Us
            </a>
            <a 
              href="/contact" 
              className="px-8 py-4 border border-white text-white text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              Contact Page
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}