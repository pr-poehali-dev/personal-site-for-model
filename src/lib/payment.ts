const PAYMENT_URL = "https://functions.poehali.dev/a4f6cd97-542b-4b5d-b623-af6381788269";

export async function createInvoice(tier: "photo" | "vip", token: string): Promise<string> {
  const res = await fetch(`${PAYMENT_URL}/?action=create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier, currency: "USD" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment error");
  if (!data.paymentUrl) throw new Error("No payment URL returned");
  return data.paymentUrl;
}
