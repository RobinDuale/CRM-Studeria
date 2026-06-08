export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ContactsClient } from "./contacts-client";
import type { Contact } from "@/lib/types";

export default async function ContactsPage() {
  const rows = await prisma.contact.findMany({ orderBy: { created_at: "desc" } });
  const contacts: Contact[] = JSON.parse(JSON.stringify(rows));
  return <ContactsClient initialContacts={contacts} />;
}
