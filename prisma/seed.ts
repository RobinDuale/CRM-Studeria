import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const password = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "robin@duale.fr" },
    update: {},
    create: { email: "robin@duale.fr", password, name: "Robin" },
  });

  // Contacts
  const contacts = await Promise.all([
    prisma.contact.upsert({ where: { email: "s.martin@arkea.fr" }, update: {}, create: { first_name: "Sophie", last_name: "Martin", email: "s.martin@arkea.fr", phone: "06 12 34 56 78", company: "Arkea Conseil" } }),
    prisma.contact.upsert({ where: { email: "t.lebrun@nexity.com" }, update: {}, create: { first_name: "Thomas", last_name: "Lebrun", email: "t.lebrun@nexity.com", phone: "07 23 45 67 89", company: "Nexity" } }),
    prisma.contact.upsert({ where: { email: "c.dupont@datavision.io" }, update: {}, create: { first_name: "Camille", last_name: "Dupont", email: "c.dupont@datavision.io", phone: "06 34 56 78 90", company: "DataVision" } }),
    prisma.contact.upsert({ where: { email: "j.bernard@lafarge.com" }, update: {}, create: { first_name: "Julien", last_name: "Bernard", email: "j.bernard@lafarge.com", phone: "06 45 67 89 01", company: "Lafarge" } }),
    prisma.contact.upsert({ where: { email: "e.moreau@decathlon.fr" }, update: {}, create: { first_name: "Élodie", last_name: "Moreau", email: "e.moreau@decathlon.fr", phone: "07 56 78 90 12", company: "Decathlon" } }),
    prisma.contact.upsert({ where: { email: "m.petit@orange.com" }, update: {}, create: { first_name: "Maxime", last_name: "Petit", email: "m.petit@orange.com", phone: "06 67 89 01 23", company: "Orange Business" } }),
    prisma.contact.upsert({ where: { email: "l.simon@sncf.fr" }, update: {}, create: { first_name: "Laura", last_name: "Simon", email: "l.simon@sncf.fr", phone: "07 78 90 12 34", company: "SNCF Connect" } }),
    prisma.contact.upsert({ where: { email: "a.laurent@capgemini.com" }, update: {}, create: { first_name: "Antoine", last_name: "Laurent", email: "a.laurent@capgemini.com", phone: "06 89 01 23 45", company: "Capgemini" } }),
    prisma.contact.upsert({ where: { email: "i.garcia@ekimetrics.com" }, update: {}, create: { first_name: "Inès", last_name: "Garcia", email: "i.garcia@ekimetrics.com", phone: "07 90 12 34 56", company: "Ekimetrics" } }),
    prisma.contact.upsert({ where: { email: "n.roux@mirakl.com" }, update: {}, create: { first_name: "Nicolas", last_name: "Roux", email: "n.roux@mirakl.com", phone: "06 01 23 45 67", company: "Mirakl" } }),
  ]);

  console.log(`✓ ${contacts.length} contacts`);

  // Products
  const products = [
    { name: "Audit SI", description: "Analyse complète du système d'information", unit_price: 4500, unit: "mission", is_active: true },
    { name: "Développement web", description: "Développement d'application sur mesure", unit_price: 850, unit: "jour", is_active: true },
    { name: "Formation technique", description: "Formation en présentiel ou distanciel", unit_price: 1200, unit: "jour", is_active: true },
    { name: "Conseil stratégique", description: "Accompagnement transformation digitale", unit_price: 1400, unit: "jour", is_active: true },
    { name: "Licence annuelle CRM", description: "Accès à la plateforme CRM SaaS", unit_price: 2400, unit: "an", is_active: true },
    { name: "Support & maintenance", description: "Support technique et mises à jour", unit_price: 600, unit: "mois", is_active: true },
    { name: "Intégration API", description: "Connecteurs et intégrations sur mesure", unit_price: 950, unit: "jour", is_active: false },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.name }, update: p, create: { id: p.name, ...p } });
  }
  console.log(`✓ ${products.length} produits`);

  // Deals
  const dealData = [
    { title: "Refonte ERP Arkea", contact: "Sophie Martin", company: "Arkea Conseil", amount: 28000, stage: "negotiation", expected_close: "2025-07-15" },
    { title: "Intégration BI Nexity", contact: "Thomas Lebrun", company: "Nexity", amount: 12500, stage: "proposal", expected_close: "2025-08-01" },
    { title: "Migration Cloud DataVision", contact: "Camille Dupont", company: "DataVision", amount: 45000, stage: "qualified", expected_close: "2025-09-30" },
    { title: "Audit SI Lafarge", contact: "Julien Bernard", company: "Lafarge", amount: 8000, stage: "prospect", expected_close: "2025-10-01" },
    { title: "Formation Data Decathlon", contact: "Élodie Moreau", company: "Decathlon", amount: 6500, stage: "won", expected_close: "2025-05-20" },
    { title: "Dashboard Analytics Orange", contact: "Maxime Petit", company: "Orange Business", amount: 19000, stage: "proposal", expected_close: "2025-07-30" },
    { title: "API Gateway SNCF", contact: "Laura Simon", company: "SNCF Connect", amount: 34000, stage: "negotiation", expected_close: "2025-08-15" },
    { title: "CRM Capgemini Interne", contact: "Antoine Laurent", company: "Capgemini", amount: 52000, stage: "qualified", expected_close: "2025-11-01" },
    { title: "POC IA Ekimetrics", contact: "Inès Garcia", company: "Ekimetrics", amount: 15000, stage: "prospect", expected_close: "2025-10-15" },
    { title: "Marketplace Mirakl Connect", contact: "Nicolas Roux", company: "Mirakl", amount: 7800, stage: "lost", expected_close: "2025-04-30" },
  ];

  for (const d of dealData) {
    await prisma.deal.create({ data: d });
  }
  console.log(`✓ ${dealData.length} deals`);

  // Invoices
  const invoiceData = [
    { invoice_number: "FAC-2025-0001", company: "Decathlon", contact: "Élodie Moreau", amount: 6500, status: "paid", issue_date: "2025-05-20", due_date: "2025-06-20" },
    { invoice_number: "FAC-2025-0002", company: "Arkea Conseil", contact: "Sophie Martin", amount: 9000, status: "sent", issue_date: "2025-05-28", due_date: "2025-06-28" },
    { invoice_number: "FAC-2025-0003", company: "Orange Business", contact: "Maxime Petit", amount: 4750, status: "overdue", issue_date: "2025-04-15", due_date: "2025-05-15" },
    { invoice_number: "FAC-2025-0004", company: "DataVision", contact: "Camille Dupont", amount: 12000, status: "draft", issue_date: "2025-06-01", due_date: "2025-07-01" },
    { invoice_number: "FAC-2025-0005", company: "Nexity", contact: "Thomas Lebrun", amount: 3200, status: "paid", issue_date: "2025-04-10", due_date: "2025-05-10" },
    { invoice_number: "FAC-2025-0006", company: "Capgemini", contact: "Antoine Laurent", amount: 16800, status: "sent", issue_date: "2025-06-05", due_date: "2025-07-05" },
  ];

  for (const inv of invoiceData) {
    await prisma.invoice.create({ data: inv });
  }
  console.log(`✓ ${invoiceData.length} factures`);

  console.log("\n✅ Base de données initialisée avec succès !");
  console.log("   Email : robin@duale.fr");
  console.log("   Mot de passe : admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
