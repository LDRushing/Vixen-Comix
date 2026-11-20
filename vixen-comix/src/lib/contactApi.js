// Sends the Contact form to the endpoint given in VITE_CONTACT_API_URL.
// The endpoint is passed in so this file stays free of import.meta.
export async function sendContactForm(endpoint, formData) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error(`Contact form failed with status ${response.status}`);
  return response;
}
