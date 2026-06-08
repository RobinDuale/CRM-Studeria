export const mockContacts = [
  { id: "1", first_name: "Sophie", last_name: "Martin", email: "s.martin@arkea.fr", phone: "06 12 34 56 78", company: "Arkea Conseil", created_at: "2024-11-03" },
  { id: "2", first_name: "Thomas", last_name: "Lebrun", email: "t.lebrun@nexity.com", phone: "07 23 45 67 89", company: "Nexity", created_at: "2024-11-15" },
  { id: "3", first_name: "Camille", last_name: "Dupont", email: "c.dupont@datavision.io", phone: "06 34 56 78 90", company: "DataVision", created_at: "2024-12-02" },
  { id: "4", first_name: "Julien", last_name: "Bernard", email: "j.bernard@lafarge.com", phone: "06 45 67 89 01", company: "Lafarge", created_at: "2025-01-08" },
  { id: "5", first_name: "Élodie", last_name: "Moreau", email: "e.moreau@decathlon.fr", phone: "07 56 78 90 12", company: "Decathlon", created_at: "2025-01-22" },
  { id: "6", first_name: "Maxime", last_name: "Petit", email: "m.petit@orange.com", phone: "06 67 89 01 23", company: "Orange Business", created_at: "2025-02-10" },
  { id: "7", first_name: "Laura", last_name: "Simon", email: "l.simon@sncf.fr", phone: "07 78 90 12 34", company: "SNCF Connect", created_at: "2025-03-05" },
  { id: "8", first_name: "Antoine", last_name: "Laurent", email: "a.laurent@capgemini.com", phone: "06 89 01 23 45", company: "Capgemini", created_at: "2025-03-18" },
  { id: "9", first_name: "Inès", last_name: "Garcia", email: "i.garcia@ekimetrics.com", phone: "07 90 12 34 56", company: "Ekimetrics", created_at: "2025-04-01" },
  { id: "10", first_name: "Nicolas", last_name: "Roux", email: "n.roux@mirakl.com", phone: "06 01 23 45 67", company: "Mirakl", created_at: "2025-04-14" },
];

export const mockDeals = [
  { id: "1", title: "Refonte ERP Arkea", contact: "Sophie Martin", company: "Arkea Conseil", amount: 28000, stage: "negotiation", expected_close: "2025-07-15" },
  { id: "2", title: "Intégration BI Nexity", contact: "Thomas Lebrun", company: "Nexity", amount: 12500, stage: "proposal", expected_close: "2025-08-01" },
  { id: "3", title: "Migration Cloud DataVision", contact: "Camille Dupont", company: "DataVision", amount: 45000, stage: "qualified", expected_close: "2025-09-30" },
  { id: "4", title: "Audit SI Lafarge", contact: "Julien Bernard", company: "Lafarge", amount: 8000, stage: "prospect", expected_close: "2025-10-01" },
  { id: "5", title: "Formation Data Decathlon", contact: "Élodie Moreau", company: "Decathlon", amount: 6500, stage: "won", expected_close: "2025-05-20" },
  { id: "6", title: "Dashboard Analytics Orange", contact: "Maxime Petit", company: "Orange Business", amount: 19000, stage: "proposal", expected_close: "2025-07-30" },
  { id: "7", title: "API Gateway SNCF", contact: "Laura Simon", company: "SNCF Connect", amount: 34000, stage: "negotiation", expected_close: "2025-08-15" },
  { id: "8", title: "CRM Capgemini Interne", contact: "Antoine Laurent", company: "Capgemini", amount: 52000, stage: "qualified", expected_close: "2025-11-01" },
  { id: "9", title: "POC IA Ekimetrics", contact: "Inès Garcia", company: "Ekimetrics", amount: 15000, stage: "prospect", expected_close: "2025-10-15" },
  { id: "10", title: "Marketplace Mirakl Connect", contact: "Nicolas Roux", company: "Mirakl", amount: 7800, stage: "lost", expected_close: "2025-04-30" },
];

export const mockProducts = [
  { id: "1", name: "Audit SI", description: "Analyse complète du système d'information", unit_price: 4500, unit: "mission", is_active: true },
  { id: "2", name: "Développement web", description: "Développement d'application sur mesure", unit_price: 850, unit: "jour", is_active: true },
  { id: "3", name: "Formation technique", description: "Formation en présentiel ou distanciel", unit_price: 1200, unit: "jour", is_active: true },
  { id: "4", name: "Conseil stratégique", description: "Accompagnement transformation digitale", unit_price: 1400, unit: "jour", is_active: true },
  { id: "5", name: "Licence annuelle CRM", description: "Accès à la plateforme CRM SaaS", unit_price: 2400, unit: "an", is_active: true },
  { id: "6", name: "Support & maintenance", description: "Support technique et mises à jour", unit_price: 600, unit: "mois", is_active: true },
  { id: "7", name: "Intégration API", description: "Connecteurs et intégrations sur mesure", unit_price: 950, unit: "jour", is_active: false },
];

export const mockInvoices = [
  { id: "1", invoice_number: "FAC-2025-0001", company: "Decathlon", contact: "Élodie Moreau", amount: 6500, status: "paid", issue_date: "2025-05-20", due_date: "2025-06-20" },
  { id: "2", invoice_number: "FAC-2025-0002", company: "Arkea Conseil", contact: "Sophie Martin", amount: 9000, status: "sent", issue_date: "2025-05-28", due_date: "2025-06-28" },
  { id: "3", invoice_number: "FAC-2025-0003", company: "Orange Business", contact: "Maxime Petit", amount: 4750, status: "overdue", issue_date: "2025-04-15", due_date: "2025-05-15" },
  { id: "4", invoice_number: "FAC-2025-0004", company: "DataVision", contact: "Camille Dupont", amount: 12000, status: "draft", issue_date: "2025-06-01", due_date: "2025-07-01" },
  { id: "5", invoice_number: "FAC-2025-0005", company: "Nexity", contact: "Thomas Lebrun", amount: 3200, status: "paid", issue_date: "2025-04-10", due_date: "2025-05-10" },
  { id: "6", invoice_number: "FAC-2025-0006", company: "Capgemini", contact: "Antoine Laurent", amount: 16800, status: "sent", issue_date: "2025-06-05", due_date: "2025-07-05" },
];

export const mockRevenueData = [
  { month: "Jan", ca: 8200 },
  { month: "Fév", ca: 11400 },
  { month: "Mar", ca: 9800 },
  { month: "Avr", ca: 15600 },
  { month: "Mai", ca: 12450 },
  { month: "Juin", ca: 18200 },
];

export const DEAL_STAGES = [
  { key: "prospect",    label: "Prospect",    color: "bg-zinc-100 text-zinc-600" },
  { key: "qualified",   label: "Qualifié",    color: "bg-blue-100 text-blue-700" },
  { key: "proposal",    label: "Proposition", color: "bg-violet-100 text-violet-700" },
  { key: "negotiation", label: "Négociation", color: "bg-amber-100 text-amber-700" },
  { key: "won",         label: "Gagné",       color: "bg-green-100 text-green-700" },
  { key: "lost",        label: "Perdu",       color: "bg-red-100 text-red-700" },
];

export const INVOICE_STATUS = {
  draft:     { label: "Brouillon",  color: "bg-zinc-100 text-zinc-600" },
  sent:      { label: "Envoyée",    color: "bg-blue-100 text-blue-700" },
  paid:      { label: "Payée",      color: "bg-green-100 text-green-700" },
  overdue:   { label: "En retard",  color: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulée",    color: "bg-zinc-100 text-zinc-500" },
};
