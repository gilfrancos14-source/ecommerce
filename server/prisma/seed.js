import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { slugify } from '../src/utils/slugify.js';

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function pickStatus() {
  const r = Math.random();
  if (r < 0.15) return 'PENDING';
  if (r < 0.35) return 'CONFIRMED';
  if (r < 0.60) return 'SHIPPED';
  if (r < 0.90) return 'DELIVERED';
  return 'CANCELLED';
}

const IMG = 'https://placehold.co/600x600/e5e7eb/6b7280?text=Product';

const variantData = {
  'Smartphone Pro X': [
    { nom: 'Noir', slug: 'noir', stock: 5 },
    { nom: 'Argent', slug: 'argent', stock: 4 },
    { nom: 'Or', slug: 'or', stock: 3 },
  ],
  'Casque Audio ANC': [
    { nom: 'Noir Mat', slug: 'noir-mat', stock: 10 },
    { nom: 'Blanc', slug: 'blanc', stock: 8 },
  ],
  'Montre Connectée Elite': [
    { nom: 'Cuir Brun', slug: 'cuir-brun', stock: 6 },
    { nom: 'Milanais Acier', slug: 'milanais-acier', stock: 7 },
    { nom: 'Silicone Noir', slug: 'silicone-noir', stock: 5 },
  ],
  'Tablette Ultra 11"': [
    { nom: 'Gris Sideral', slug: 'gris-sideral', stock: 4 },
    { nom: 'Argent', slug: 'argent', stock: 4 },
  ],
  'Enceinte Bluetooth Mini': [
    { nom: 'Bleu Nuit', slug: 'bleu-nuit', stock: 1 },
    { nom: 'Rouge', slug: 'rouge', stock: 2 },
  ],
  'T-Shirt Coton Bio': [
    { nom: 'Blanc', slug: 'blanc', stock: 15 },
    { nom: 'Noir', slug: 'noir', stock: 15 },
    { nom: 'Gris Chiné', slug: 'gris-chine', stock: 15 },
  ],
  'Jean Slim Noir': [
    { nom: 'Taille 38', slug: 'taille-38', stock: 8 },
    { nom: 'Taille 40', slug: 'taille-40', stock: 10 },
    { nom: 'Taille 42', slug: 'taille-42', stock: 8 },
    { nom: 'Taille 44', slug: 'taille-44', stock: 4 },
  ],
  'Veste en Cuir': [
    { nom: 'Marron', slug: 'marron', stock: 5 },
    { nom: 'Noir', slug: 'noir', stock: 5 },
    { nom: 'Cognac', slug: 'cognac', stock: 5 },
  ],
  'Sneakers Blanches': [
    { nom: 'Taille 40', slug: 'taille-40', stock: 1 },
    { nom: 'Taille 42', slug: 'taille-42', stock: 1 },
  ],
  'Écharpe Laine': [
    { nom: 'Gris', slug: 'gris', stock: 2 },
    { nom: 'Bordeaux', slug: 'bordeaux', stock: 2 },
  ],
  'Lampe de Bureau LED': [
    { nom: 'Noir', slug: 'noir', stock: 10 },
    { nom: 'Blanc', slug: 'blanc', stock: 10 },
  ],
  'Machine à Café Pro': [
    { nom: 'Noir', slug: 'noir', stock: 3 },
    { nom: 'Chrome', slug: 'chrome', stock: 4 },
  ],
  'Couette Premium': [
    { nom: 'Simple 140cm', slug: 'simple-140', stock: 1 },
    { nom: 'Double 200cm', slug: 'double-200', stock: 0 },
  ],
  'Panneau Déco Bois': [
    { nom: 'Chêne Clair', slug: 'chene-clair', stock: 7 },
    { nom: 'Chêne Foncé', slug: 'chene-fonce', stock: 7 },
  ],
  'Yoga Mat Premium': [
    { nom: 'Bleu', slug: 'bleu', stock: 2 },
    { nom: 'Rose', slug: 'rose', stock: 2 },
    { nom: 'Vert', slug: 'vert', stock: 1 },
  ],
  'Chaussures Running': [
    { nom: 'Noir/Rouge', slug: 'noir-rouge', stock: 8 },
    { nom: 'Gris/Bleu', slug: 'gris-bleu', stock: 7 },
    { nom: 'Blanc/Vert', slug: 'blanc-vert', stock: 7 },
  ],
  'Haltères Adjustable': [
    { nom: 'Set 2-10kg', slug: 'set-2-10kg', stock: 5 },
    { nom: 'Set 2-20kg', slug: 'set-2-20kg', stock: 5 },
  ],
  'Parfum Noir Intense': [
    { nom: '50ml', slug: '50ml', stock: 6 },
    { nom: '100ml', slug: '100ml', stock: 6 },
    { nom: '200ml', slug: '200ml', stock: 4 },
  ],
  'Crème Visage Luxe': [
    { nom: 'Peau Normale', slug: 'peau-normale', stock: 2 },
    { nom: 'Peau Sèche', slug: 'peau-seche', stock: 2 },
  ],
  'Coffret Soin Complet': [
    { nom: 'Coffret Homme', slug: 'coffret-homme', stock: 4 },
    { nom: 'Coffret Femme', slug: 'coffret-femme', stock: 5 },
  ],
};

async function main() {
  console.log('Nettoyage...');
  await prisma.$executeRaw`TRUNCATE TABLE "WishlistItem", "CartItem", "Review", "OrderItem", "Order", "ProductVariant", "Product", "Category", "Newsletter", "User" CASCADE`;

  const hashed = await bcrypt.hash('admin123', 12);

  console.log('Création des utilisateurs...');
  const admin = await prisma.user.create({
    data: { nom: 'Admin LUXE', email: 'admin@ecommerce.com', password: hashed, role: 'ADMIN', phone: '06 12 34 56 78', adresse: '10 Rue du Faubourg, Paris' },
  });

  const clientData = [
    { nom: 'Marie Dupont', email: 'marie@test.com', phone: '06 98 76 54 32', adresse: '25 Avenue des Champs, Lyon' },
    { nom: 'Jean Martin', email: 'jean@test.com', phone: '06 11 22 33 44', adresse: '8 Boulevard Victor Hugo, Marseille' },
    { nom: 'Sophie Bernard', email: 'sophie@test.com', phone: '06 55 66 77 88', adresse: '3 Rue de la Paix, Bordeaux' },
    { nom: 'Lucas Petit', email: 'lucas@test.com', phone: '06 44 33 22 11', adresse: '14 Rue Jean Jaurès, Toulouse' },
  ];
  const clients = [];
  for (const c of clientData) {
    clients.push(await prisma.user.create({ data: { ...c, password: hashed, role: 'CLIENT' } }));
  }
  const allUsers = [admin, ...clients];

  console.log('Création des catégories...');
  const catE = await prisma.category.create({ data: { nom: 'Électronique', slug: 'electronique', description: 'Smartphones, casques, gadgets' } });
  const catM = await prisma.category.create({ data: { nom: 'Mode', slug: 'mode', description: 'Vêtements et accessoires' } });
  const catH = await prisma.category.create({ data: { nom: 'Maison', slug: 'maison', description: 'Décoration et mobilier' } });
  const catS = await prisma.category.create({ data: { nom: 'Sport', slug: 'sport', description: 'Équipements sportifs' } });
  const catB = await prisma.category.create({ data: { nom: 'Beauté', slug: 'beaute', description: 'Soins et parfums' } });

  console.log('Création des produits avec variantes...');
  const pData = [
    { nom: 'Smartphone Pro X', prix: 899.99, stock: 12, categoryId: catE.id, featured: true, description: 'Smartphone OLED 6.7"' },
    { nom: 'Casque Audio ANC', prix: 149.99, compareAtPrice: 199.99, stock: 25, categoryId: catE.id, featured: true, description: 'Casque Bluetooth réduction de bruit' },
    { nom: 'Montre Connectée Elite', prix: 249.99, stock: 18, categoryId: catE.id, featured: false, description: 'Montre intelligente GPS' },
    { nom: 'Tablette Ultra 11"', prix: 549.99, stock: 8, categoryId: catE.id, featured: true, description: 'Tablette professionnelle' },
    { nom: 'Enceinte Bluetooth Mini', prix: 59.99, stock: 3, categoryId: catE.id, featured: false, description: 'Enceinte waterproof 12h' },
    { nom: 'T-Shirt Coton Bio', prix: 29.99, stock: 45, categoryId: catM.id, featured: true, description: 'T-shirt coton biologique' },
    { nom: 'Jean Slim Noir', prix: 79.99, compareAtPrice: 99.99, stock: 30, categoryId: catM.id, featured: false, description: 'Jean slim denim stretch' },
    { nom: 'Veste en Cuir', prix: 299.99, stock: 15, categoryId: catM.id, featured: true, description: 'Veste cuir véritable' },
    { nom: 'Sneakers Blanches', prix: 119.99, stock: 2, categoryId: catM.id, featured: false, description: 'Sneakers cuir blanc' },
    { nom: 'Écharpe Laine', prix: 49.99, stock: 4, categoryId: catM.id, featured: false, description: 'Écharpe laine mérinos' },
    { nom: 'Lampe de Bureau LED', prix: 69.99, stock: 20, categoryId: catH.id, featured: false, description: 'Lampe LED réglable' },
    { nom: 'Machine à Café Pro', prix: 399.99, stock: 7, categoryId: catH.id, featured: true, description: 'Machine expresso automatique' },
    { nom: 'Couette Premium', prix: 129.99, compareAtPrice: 159.99, stock: 1, categoryId: catH.id, featured: false, description: 'Couette duvet d\'oie' },
    { nom: 'Panneau Déco Bois', prix: 89.99, stock: 14, categoryId: catH.id, featured: false, description: 'Panneau mural chêne' },
    { nom: 'Yoga Mat Premium', prix: 59.99, stock: 5, categoryId: catS.id, featured: true, description: 'Tapis yoga antidérapant' },
    { nom: 'Chaussures Running', prix: 139.99, stock: 22, categoryId: catS.id, featured: false, description: 'Running amorti maximal' },
    { nom: 'Haltères Adjustable', prix: 199.99, stock: 10, categoryId: catS.id, featured: false, description: 'Set haltères 2-20kg' },
    { nom: 'Parfum Noir Intense', prix: 89.99, stock: 16, categoryId: catB.id, featured: true, description: 'Eau de parfum boisée 100ml' },
    { nom: 'Crème Visage Luxe', prix: 64.99, compareAtPrice: 79.99, stock: 4, categoryId: catB.id, featured: false, description: 'Crème anti-âge à la rose' },
    { nom: 'Coffret Soin Complet', prix: 149.99, stock: 9, categoryId: catB.id, featured: true, description: 'Coffret soin complet' },
  ];

  const products = [];
  for (const p of pData) {
    const product = await prisma.product.create({
      data: { ...p, slug: slugify(p.nom), images: JSON.stringify([IMG]) },
    });
    products.push(product);
  }

  console.log('Création des variantes...');
  const allVariants = [];
  for (const product of products) {
    const variants = variantData[product.nom] || [];
    for (const v of variants) {
      const variant = await prisma.productVariant.create({
        data: {
          nom: v.nom,
          slug: v.slug,
          prix: product.prix,
          compareAtPrice: product.compareAtPrice,
          stock: v.stock,
          images: JSON.stringify([IMG]),
          productId: product.id,
        },
      });
      allVariants.push(variant);
    }
  }

  console.log('Création des commandes (45 sur 30 jours)...');
  for (let i = 0; i < 45; i++) {
    const user = allUsers[i % allUsers.length];
    const dayOffset = Math.floor(Math.random() * 30);
    const numItems = 1 + Math.floor(Math.random() * 3);
    const usedProducts = new Set();
    const orderItems = [];

    for (let j = 0; j < numItems; j++) {
      let productIdx;
      do { productIdx = Math.floor(Math.random() * products.length); } while (usedProducts.has(productIdx));
      usedProducts.add(productIdx);
      const product = products[productIdx];
      const productVariants = allVariants.filter((v) => v.productId === product.id);
      const useVariant = productVariants.length > 0 && Math.random() > 0.3;
      const variant = useVariant ? productVariants[Math.floor(Math.random() * productVariants.length)] : null;

      orderItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        quantity: 1,
        prix: variant ? variant.prix : product.prix,
      });
    }

    const total = orderItems.reduce((sum, item) => sum + item.prix * item.quantity, 0);
    const status = pickStatus();

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status,
        adresseLivraison: user.adresse || '10 Rue Example, Paris',
        phone: user.phone || '06 00 00 00 00',
        createdAt: daysAgo(dayOffset),
        items: { create: orderItems },
      },
    });

    if ((i + 1) % 15 === 0) console.log(`  ${i + 1}/45 commandes créées`);
  }

  console.log('Création des avis...');
  const reviewComments = [
    'Excellent produit, je recommande !',
    'Très satisfait de mon achat.',
    'Bon rapport qualité-prix.',
    'Livraison rapide, produit conforme.',
    'Un peu déçu par la finition.',
    'Parfait pour un usage quotidien.',
    'Produit fidèle à la description.',
    'Je rachèterais sans hésiter.',
    'Superbe ! Dépasse mes attentes.',
  ];
  for (const c of clients) {
    const numReviews = 2 + Math.floor(Math.random() * 4);
    const reviewed = new Set();
    for (let i = 0; i < numReviews; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * products.length); } while (reviewed.has(idx));
      reviewed.add(idx);
      await prisma.review.create({
        data: {
          userId: c.id,
          productId: products[idx].id,
          note: 3 + Math.floor(Math.random() * 3),
          commentaire: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          createdAt: daysAgo(Math.floor(Math.random() * 25)),
        },
      });
    }
  }

  console.log('Création des favoris et paniers...');
  for (const c of clients) {
    const numWish = 1 + Math.floor(Math.random() * 3);
    const wishIds = new Set();
    for (let i = 0; i < numWish; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * products.length); } while (wishIds.has(idx));
      wishIds.add(idx);
      await prisma.wishlistItem.create({ data: { userId: c.id, productId: products[idx].id } });
    }
    const numCart = 1 + Math.floor(Math.random() * 3);
    const cartIds = new Set();
    for (let j = 0; j < numCart; j++) {
      let idx;
      do { idx = Math.floor(Math.random() * products.length); } while (cartIds.has(idx));
      cartIds.add(idx);
      const productVariants = allVariants.filter((v) => v.productId === products[idx].id);
      const useVariant = productVariants.length > 0 && Math.random() > 0.4;
      const variant = useVariant ? productVariants[Math.floor(Math.random() * productVariants.length)] : null;
      await prisma.cartItem.create({
        data: {
          userId: c.id,
          productId: products[idx].id,
          variantId: variant?.id || null,
          quantity: 1 + Math.floor(Math.random() * 3),
        },
      });
    }
  }

  await prisma.newsletter.create({ data: { email: 'marie@test.com', subscribed: true } });
  await prisma.newsletter.create({ data: { email: 'jean@test.com', subscribed: true } });

  await prisma.deliveryMethod.createMany({
    data: [
      { nom: 'Standard', description: 'Livraison en 3-5 jours ouvrés', price: 0, freeFrom: 50, estimatedDays: '3-5 jours ouvrés', carrier: 'Colissimo', active: true },
      { nom: 'Express', description: 'Livraison en 24-48h', price: 5.90, freeFrom: null, estimatedDays: '1-2 jours ouvrés', carrier: 'Chronopost', active: true },
      { nom: 'Point Relais', description: 'Retrait en point relais sous 3-5 jours', price: 3.99, freeFrom: 40, estimatedDays: '3-5 jours ouvrés', carrier: 'Colissimo', active: true },
    ],
  });

  console.log('');
  console.log('=== Seed terminé ===');
  console.log(`${products.length} produits, ${allVariants.length} variantes, 45 commandes, 5 catégories, 3 modes de livraison`);
  console.log('');
  console.log('Comptes :');
  console.log('  admin@ecommerce.com / admin123 (ADMIN)');
  console.log('  marie@test.com      / admin123 (CLIENT)');
  console.log('  jean@test.com       / admin123 (CLIENT)');
  console.log('  sophie@test.com     / admin123 (CLIENT)');
  console.log('  lucas@test.com      / admin123 (CLIENT)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
