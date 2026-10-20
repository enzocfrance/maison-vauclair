"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { primaryAction } from "@/frontend/components/action-styles";
import { ArrowRightIcon } from "@/frontend/components/icons";
import { StepHeader } from "@/frontend/components/step-header";
import { getDictionary, languageNames, type Dictionary } from "@/frontend/i18n";
import { capitalize, format, formatLongDate } from "@/frontend/i18n/format";
import { formatRich } from "@/frontend/i18n/rich-text";
import { boxSizes } from "@/shared/catalog/box-sizes";
import type { Product } from "@/shared/catalog/product";
import type { IsoDate } from "@/shared/delivery/calendar";
import {
  christmasOutlook,
  estimateDelivery,
  shippingProfile,
  type DeliveryEstimate,
} from "@/shared/delivery/delivery";
import { withDemoDate } from "@/shared/demo";
import { locales, type Locale } from "@/shared/i18n/locales";
import { localizedPath } from "@/shared/i18n/routes";
import { formatChf } from "@/shared/money";
import {
  checkBoxContents,
  collectErrors,
  createdOrderResponseSchema,
  messageMaxLength,
  orderApiPath,
  orderErrorsResponseSchema,
  orderFields,
  orderRequestSchema,
  type OrderErrors,
  type OrderField,
} from "@/shared/order/order-request";
import { priceBox } from "@/shared/pricing";
import { useBox, useHydrated } from "./box-store";
import { PriceLines } from "./price-lines";

type DeliveryTexts = Dictionary["delivery"];

type DeliveryFormProps = {
  locale: Locale;
  products: readonly Product[];
  today: IsoDate;
  demoDate: IsoDate | null;
};

type FormState = {
  recipientName: string;
  street: string;
  postalCode: string;
  city: string;
  cardLanguage: Locale;
  message: string;
  welcomeCard: boolean;
  buyerName: string;
  buyerEmail: string;
  ageConfirmed: boolean;
};

/** The control of each field, to move the focus to the first error. */
const fieldIds: Record<OrderField, string> = {
  "recipient.name": "recipient-name",
  "recipient.street": "recipient-street",
  "recipient.postalCode": "recipient-postal-code",
  "recipient.city": "recipient-city",
  message: "message",
  "buyer.name": "buyer-name",
  "buyer.email": "buyer-email",
  ageConfirmed: "age-confirmed",
  box: "form-alert",
};

function focusFirstError(errors: OrderErrors) {
  const first = orderFields.find((field) => errors[field]);
  if (!first) return;
  requestAnimationFrame(() =>
    document.getElementById(fieldIds[first])?.focus(),
  );
}

export function DeliveryForm({
  locale,
  products,
  today,
  demoDate,
}: DeliveryFormProps) {
  const dictionary = getDictionary(locale);
  const t = dictionary.delivery;
  const router = useRouter();
  const box = useBox();
  const hydrated = useHydrated();
  const [form, setForm] = useState<FormState>({
    recipientName: "",
    street: "",
    postalCode: "",
    city: "",
    cardLanguage: locale,
    message: "",
    welcomeCard: true,
    buyerName: "",
    buyerEmail: "",
    ageConfirmed: false,
  });
  const [errors, setErrors] = useState<OrderErrors>({});
  const [networkFailure, setNetworkFailure] = useState(false);
  const [sending, setSending] = useState(false);

  const fillHref = withDemoDate(localizedPath(locale, "boxFill"), demoDate);
  const size = box.sizeId ? boxSizes[box.sizeId] : null;
  const header = (
    <StepHeader
      backHref={fillHref}
      backLabel={t.back}
      eyebrow={
        size
          ? format(t.summary, {
              size: dictionary.sizes[size.id],
              count: size.itemCount,
            })
          : t.eyebrow
      }
      title={t.heading}
    />
  );

  const items = box.productIds.flatMap(
    (id) => products.find((product) => product.id === id) ?? [],
  );

  // The box is read from the browser: say nothing before it is.
  if (!hydrated) return header;
  if (!size || items.length !== size.itemCount) {
    return (
      <>
        {header}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-12">
          <p>{t.incomplete}</p>
          <Link href={fillHref} className={primaryAction}>
            <span>{t.backToFill}</span>
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </>
    );
  }

  const sizeId = size.id;
  const estimate = estimateDelivery(today, shippingProfile(items));
  const price = priceBox(sizeId, items);
  const hasWine = items.some((item) => item.alcohol);
  const firstName = form.recipientName.trim().split(/\s+/)[0] ?? "";

  function update<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function errorFor(field: OrderField): string | undefined {
    if (!errors[field]) return undefined;
    return format(t.errors[field], { max: messageMaxLength });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setNetworkFailure(false);

    const request = {
      locale,
      sizeId,
      productIds: [...box.productIds],
      recipient: {
        name: form.recipientName,
        street: form.street,
        postalCode: form.postalCode,
        city: form.city,
      },
      cardLanguage: form.cardLanguage,
      message: form.message,
      welcomeCard: form.welcomeCard,
      buyer: { name: form.buyerName, email: form.buyerEmail },
      ageConfirmed: hasWine && form.ageConfirmed,
      expectedDeliveryDate: estimate.deliveryDate,
      ...(demoDate ? { demoDate } : {}),
    };

    // Same rules as the server, checked first for an immediate answer.
    const parsed = orderRequestSchema.safeParse(request);
    const contents = parsed.success
      ? checkBoxContents(parsed.data, products)
      : null;
    const found = !parsed.success
      ? collectErrors(parsed.error)
      : contents && !contents.ok
        ? contents.errors
        : {};
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    setSending(true);
    try {
      const response = await fetch(orderApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const payload: unknown = await response.json();
      const created = createdOrderResponseSchema.safeParse(payload);
      if (response.ok && created.success) {
        const confirmation = localizedPath(locale, "boxConfirmation", {
          orderId: created.data.orderId,
        });
        router.push(
          withDemoDate(
            `${confirmation}?key=${created.data.accessToken}`,
            demoDate,
          ),
        );
        return;
      }
      const refused = orderErrorsResponseSchema.safeParse(payload);
      if (refused.success) {
        setErrors(refused.data.errors);
        focusFirstError(refused.data.errors);
      } else {
        setNetworkFailure(true);
        focusFirstError({ box: true });
      }
    } catch {
      setNetworkFailure(true);
      focusFirstError({ box: true });
    }
    setSending(false);
  }

  const alert =
    errors.box || networkFailure ? (
      <p
        id={fieldIds.box}
        role="alert"
        tabIndex={-1}
        className="border border-accent p-3 text-sm text-accent"
      >
        {errors.box ? (
          <>
            {t.errors.box}{" "}
            <Link href={fillHref} className="underline underline-offset-4">
              {t.backToFill}
            </Link>
          </>
        ) : (
          t.errors.network
        )}
      </p>
    ) : null;

  const submitButton = (
    <button
      type="submit"
      disabled={sending}
      className={`${primaryAction} w-full disabled:cursor-wait disabled:opacity-70`}
    >
      <span>{sending ? t.sending : t.submit}</span>
      <ArrowRightIcon className="size-5" />
    </button>
  );

  const summary = format(t.summary, {
    size: dictionary.sizes[sizeId],
    count: size.itemCount,
  });

  return (
    <>
      {header}
      <form
        noValidate
        onSubmit={submit}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12 lg:px-5 lg:py-8"
      >
        <div className="flex flex-col gap-8 px-4 pb-10 lg:px-0">
          <div className="lg:hidden">
            <DeliveryInfo
              locale={locale}
              today={today}
              estimate={estimate}
              texts={t}
            />
          </div>

          {alert}

          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 text-xl font-light">{t.recipient}</legend>
            <TextField
              id={fieldIds["recipient.name"]}
              label={t.recipientName}
              value={form.recipientName}
              onChange={(value) => update("recipientName", value)}
              autoComplete="shipping name"
              error={errorFor("recipient.name")}
            />
            <TextField
              id={fieldIds["recipient.street"]}
              label={t.street}
              value={form.street}
              onChange={(value) => update("street", value)}
              autoComplete="shipping street-address"
              error={errorFor("recipient.street")}
            />
            <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4">
              <TextField
                id={fieldIds["recipient.postalCode"]}
                label={t.postalCode}
                value={form.postalCode}
                onChange={(value) => update("postalCode", value)}
                autoComplete="shipping postal-code"
                inputMode="numeric"
                maxLength={4}
                error={errorFor("recipient.postalCode")}
              />
              <TextField
                id={fieldIds["recipient.city"]}
                label={t.city}
                value={form.city}
                onChange={(value) => update("city", value)}
                autoComplete="shipping address-level2"
                error={errorFor("recipient.city")}
              />
            </div>
            <p className="-mt-2 text-xs text-muted">{t.switzerlandOnly}</p>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 label-caps text-[0.625rem] text-muted">
              {t.cardLanguage}
            </legend>
            <div className="flex gap-3">
              {locales.map((candidate) => (
                <label
                  key={candidate}
                  className="flex min-h-11 cursor-pointer items-center gap-2.5 border border-line px-4 has-[:checked]:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
                >
                  <input
                    type="radio"
                    name="card-language"
                    value={candidate}
                    checked={form.cardLanguage === candidate}
                    onChange={() => update("cardLanguage", candidate)}
                    className="size-4 accent-ink focus-visible:outline-none"
                  />
                  <span lang={candidate}>{languageNames[candidate]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <TextField
            id={fieldIds.message}
            label={t.message}
            value={form.message}
            onChange={(value) => update("message", value)}
            multiline
            hint={format(t.messageHint, {
              count: form.message.length,
              max: messageMaxLength,
            })}
            error={errorFor("message")}
          />

          <CheckboxField
            id="welcome-card"
            checked={form.welcomeCard}
            onChange={(checked) => update("welcomeCard", checked)}
          >
            <span className="font-medium">{t.welcomeCard}</span>{" "}
            {format(t.welcomeCardDetail, {
              name: firstName || t.welcomeCardFallback,
            })}
          </CheckboxField>

          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 text-xl font-light">{t.buyer}</legend>
            <TextField
              id={fieldIds["buyer.name"]}
              label={t.buyerName}
              value={form.buyerName}
              onChange={(value) => update("buyerName", value)}
              autoComplete="name"
              error={errorFor("buyer.name")}
            />
            <TextField
              id={fieldIds["buyer.email"]}
              label={t.buyerEmail}
              value={form.buyerEmail}
              onChange={(value) => update("buyerEmail", value)}
              type="email"
              autoComplete="email"
              hint={t.buyerEmailHint}
              error={errorFor("buyer.email")}
            />
          </fieldset>

          {hasWine && (
            <CheckboxField
              id={fieldIds.ageConfirmed}
              checked={form.ageConfirmed}
              onChange={(checked) => update("ageConfirmed", checked)}
              hint={t.ageHint}
              error={errorFor("ageConfirmed")}
            >
              {t.age}
            </CheckboxField>
          )}
        </div>

        <aside aria-label={summary} className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-5 border border-ink p-6">
            <DeliveryInfo
              locale={locale}
              today={today}
              estimate={estimate}
              texts={t}
            />
            <p className="label-caps text-muted">{summary}</p>
            <ul className="flex flex-col text-sm">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-line py-1.5 last:border-b-0"
                >
                  <span className="min-w-0">{item.name[locale]}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatChf(item.priceCents)}
                  </span>
                </li>
              ))}
            </ul>
            <PriceLines price={price} texts={dictionary.fill} />
            {submitButton}
          </div>
        </aside>

        <div className="sticky bottom-0 z-10 mt-auto border-t border-ink bg-white lg:hidden">
          <div className="flex flex-col gap-3 px-4 pt-3.5 pb-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[0.625rem] font-semibold tracking-label text-muted uppercase">
                {summary}
              </span>
              <span className="text-[1.375rem] tabular-nums">
                {formatChf(price.totalCents)}
              </span>
            </div>
            {submitButton}
          </div>
        </div>
      </form>
    </>
  );
}

function DeliveryInfo({
  locale,
  today,
  estimate,
  texts: t,
}: {
  locale: Locale;
  today: IsoDate;
  estimate: DeliveryEstimate;
  texts: DeliveryTexts;
}) {
  const headingId = useId();
  const outlook = christmasOutlook(today, estimate.profile);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5 pt-7 lg:pt-0">
        <h2 id={headingId} className="label-caps text-muted">
          {t.expected}
        </h2>
        <p className="flex items-center gap-3 text-[2.125rem] leading-[1.05] font-light tracking-[-0.03em] lg:text-[1.75rem]">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full bg-accent"
          />
          {capitalize(formatLongDate(estimate.deliveryDate, locale))}
        </p>
        <p className="text-sm leading-normal text-muted">
          {format(
            estimate.profile === "fresh" ? t.shippedFresh : t.shippedAmbient,
            { date: formatLongDate(estimate.shipDate, locale) },
          )}
        </p>
      </div>
      {outlook && (
        <p className="border-y border-ink py-3 text-[0.8125rem] leading-snug">
          {formatRich(outlook.passed ? t.rulePassed : t.ruleBefore, {
            date: (
              <strong className="font-semibold">
                {formatLongDate(outlook.deadline, locale)}
              </strong>
            ),
          })}
        </p>
      )}
    </section>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  multiline = false,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  multiline?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  inputMode?: "numeric";
  maxLength?: number;
}) {
  const common = {
    id,
    name: id,
    value,
    required: !multiline,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(id, hint, error),
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[0.625rem] font-semibold tracking-label text-muted uppercase"
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          {...common}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className="resize-none border border-ink bg-transparent p-3 text-[0.9375rem] leading-normal aria-invalid:border-accent"
        />
      ) : (
        <input
          {...common}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full min-w-0 rounded-none border-0 border-b border-ink bg-transparent text-base aria-invalid:border-accent"
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckboxField({
  id,
  checked,
  onChange,
  hint,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className="mt-0.5 size-5 shrink-0 accent-ink"
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug">
          {children}
        </label>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="pl-8 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="pl-8 text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
