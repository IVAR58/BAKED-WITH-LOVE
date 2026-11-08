/* Seed initial data: settings, categories, products, admin account. */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const SETTINGS = [
  ["store_name", "Baked with Love"],
  ["store_subtitle", "Pâtisserie"],
  ["tagline", "Atelier spécialisé en macarons artisanaux"],
  ["city", "Bordj Bou Arreridj"],
  ["instagram", "bakedwithl_ove"],
  ["delivery_fee_bbr", "400"],
  ["delivery_fee_national", "1500"],
  ["delivery_zones",
   "Récupération à l'atelier — Bordj Bou Arreridj. Livraison possible sur la ville et les communes limitrophes ; pour les autres wilayas, nous confirmons les modalités par message."],
  ["announcement",
   "Atelier spécialisé en macarons artisanaux — Qualité • Précision • Élégance"],
  ["hero_headline", "Des macarons d'exception, faits avec amour"],
];

const CATEGORIES = [
  ["macarons", "Macarons classiques", "Des macarons artisanaux aux coques fines, préparés à la commande.", 1],
  ["coffrets", "Coffrets de macarons", "De belles boîtes élégantes, prêtes à offrir ou à savourer.", 2],
  ["centres-de-table", "Centres de table", "Des pièces d'exception pour vos réceptions et mariages.", 3],
  ["collections-speciales", "Collections spéciales", "Créations sur mesure et éditions limitées de l'atelier.", 4],
];

const PRODUCTS = [
  {
    name: "Les Classiques de l'Atelier — 6 pièces",
    slug: "les-classiques-de-l-atelier",
    category: "macarons",
    price: 900,
    stock: 30,
    images: ["/images/hero-macarons.jpg"],
    flavors: ["Fraise", "Vanille"],
    short: "Six macarons artisanaux aux coques fines, garnis d'une crème légère et onctueuse.",
    description:
      "L'assortiment emblématique de l'atelier : de petits macarons délicats, dressés comme on présente une pièce précieuse. Les coques sont travaillées à la main pour rester fines et croustillantes, la crème est montée sur le vif. Une première découverte parfaite de notre savoir-faire, servie à l'unité comme en partage.",
    available: true, featured: true, bestseller: true, limited: false, sort: 1,
  },
  {
    name: "Coffret Signature — 12 pièces",
    slug: "coffret-signature",
    category: "coffrets",
    price: 2500,
    stock: 20,
    images: ["/images/coffret-signature.jpg"],
    flavors: ["Fraise", "Vanille", "Rose"],
    short: "Douze macarons signature dans une boîte ivoire sobre et raffinée.",
    description:
      "Notre coffret emblématique : douze macarons disposés avec soin dans une boîte ivoire aux lignes pures. Les coloris, choisis entre rouge intense et ivoire, s'accordent aussi bien à un moment de partage qu'à un joli cadeau. La boîte se referme comme un écrin — simple, élégante, précieuse.",
    available: true, featured: true, bestseller: true, limited: false, sort: 2,
  },
  {
    name: "Coffret Cadeau Ruban — 16 pièces",
    slug: "coffret-cadeau-ruban",
    category: "coffrets",
    price: 3000,
    stock: 15,
    images: ["/images/coffret-ruban.jpg"],
    flavors: ["Pistache", "Cacao", "Fraise"],
    short: "Seize macarons colorés, boîte nouée d'un ruban de satin et carte signée.",
    description:
      "Le coffret qui s'offre sans mot dire : seize macarons aux coloris variés, enfermés sous un couvercle transparent et noués d'un large ruban de satin. Une petite carte signée de l'atelier accompagne la boîte. Chaque pièce est préparée à la commande pour arriver au sommet de sa fraîcheur.",
    available: true, featured: true, bestseller: false, limited: false, sort: 3,
  },
  {
    name: "Coffret Mariage « Or » — 18 pièces",
    slug: "coffret-mariage-or",
    category: "coffrets",
    price: 4500,
    stock: 8,
    images: ["/images/coffret-mariage-or.jpg"],
    flavors: ["Douceur bleue", "Lavande", "Ivoire"],
    short: "Dix-huit macarons pastels ornés de décorations dorées en forme d'anneaux, ruban de satin et carte.",
    description:
      "Une création réservée aux plus belles occasions : dix-huit macarons aux teintes pastel — bleu poudré et lavande — chacun couronné d'une fine décoration dorée en forme d'anneaux. Le tout dans une boîte claire ceinturée de satin, avec une carte dédiée. Pensé pour les tables de mariage, les fiançailles et les demandes en mariage.",
    available: true, featured: true, bestseller: true, limited: true, sort: 4,
  },
  {
    name: "Coffret Mariage « Violette » — 18 pièces",
    slug: "coffret-mariage-violette",
    category: "coffrets",
    price: 4500,
    stock: 8,
    images: ["/images/coffret-mariage-violette.jpg"],
    flavors: ["Violette", "Rose poudré", "Vanille dorée"],
    short: "Dix-huit macarons violette, rose poudré et vanille, décorations or, ruban crème.",
    description:
      "L'harmonie violette, rose poudré et vanille dorée : dix-huit macarons posés dans une longue boîte blanche, chacun décoré d'un anneau doré et de sa quenelle de crème. Le ruban crème et la carte signée complètent l'ensemble. Une palette douce et précieuse, choisie avec vous pour épouser le thème de votre journée.",
    available: true, featured: true, bestseller: false, limited: true, sort: 5,
  },
  {
    name: "Centre de Table Mariage",
    slug: "centre-table-mariage",
    category: "centres-de-table",
    price: 6000,
    stock: 5,
    images: ["/images/centre-table.jpg"],
    flavors: ["Rouge intense", "Ivoire"],
    short: "Un rond généreux de macarons rouge et ivoire, gypsophile et détails or, sur pied de verre.",
    description:
      "La pièce maîtresse de la table : un rond complet de macarons rouges et ivoires dressés en cercles concentriques sur un pied de verre, parsemé de gypsophile et de fines décorations dorées. Composé sur mesure selon le thème et les couleurs de votre réception. Pensez à commander à l'avance pour garantir la disponibilité de votre modèle.",
    available: true, featured: true, bestseller: false, limited: true, sort: 6,
  },
  {
    name: "Pyramide Personnalisée",
    slug: "pyramide-personnalisee",
    category: "collections-speciales",
    price: 5000,
    stock: 5,
    images: ["/images/pyramide.jpg"],
    flavors: ["Composée selon votre thème"],
    short: "Une pyramide d'exception pour vos réceptions, composée selon vos couleurs et votre thème.",
    description:
      "Notre grande création sur mesure : une pyramide de macarons montée sur son pied, que nous composons avec vous — coloris, décorations et détails selon le thème de votre événement. Chaque pyramide est une pièce unique, réalisée à la commande. Nous vous confirmerons la disponibilité et les modalités de votre projet par message.",
    available: true, featured: false, bestseller: false, limited: true, sort: 7,
  },
];

async function run() {
  // Settings (jamais d'écrasement : on insère seulement les clés manquantes)
  for (const [key, value] of SETTINGS) {
    await pool.query(
      "insert into settings (key, value) values ($1, $2) on conflict (key) do nothing",
      [key, value],
    );
  }

  // Categories
  for (const [slug, name, description, sort] of CATEGORIES) {
    await pool.query(
      `insert into categories (slug, name, description, sort) values ($1, $2, $3, $4)
       on conflict (slug) do update set name = excluded.name, description = excluded.description, sort = excluded.sort`,
      [slug, name, description, sort],
    );
  }

  const catIds = Object.fromEntries(
    (await pool.query("select id, slug from categories")).rows.map((r) => [r.slug, r.id]),
  );

  for (const p of PRODUCTS) {
    await pool.query(
      `insert into products (name, slug, short_description, description, price, category_id, images, flavors, stock, available, featured, bestseller, limited, sort, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())
       on conflict (slug) do update set
         name = excluded.name,
         short_description = excluded.short_description,
         description = excluded.description,
         price = excluded.price,
         category_id = excluded.category_id,
         images = excluded.images,
         flavors = excluded.flavors,
         stock = excluded.stock,
         available = excluded.available,
         featured = excluded.featured,
         bestseller = excluded.bestseller,
         limited = excluded.limited,
         sort = excluded.sort,
         updated_at = now()`,
      [
        p.name, p.slug, p.short, p.description, p.price, catIds[p.category],
        JSON.stringify(p.images), JSON.stringify(p.flavors), p.stock,
        p.available, p.featured, p.bestseller, p.limited, p.sort,
      ],
    );
  }

  // Admin account (uniquement s'il n'existe pas)
  const existing = await pool.query("select id from admins limit 1");
  if (existing.rows.length === 0) {
    await pool.query("insert into admins (username, password_hash) values ($1, $2)", [
      "luna",
      hashPassword("BWL-Atelier-2025"),
    ]);
    console.log("Compte administrateur créé : luna");
  }

  const count = (await pool.query("select count(*)::int as n from products")).rows[0].n;
  console.log(`Seed terminé : ${count} produits, 4 catégories, réglages par défaut.`);
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
