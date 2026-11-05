import { Collection, PrismaClient, ProductType, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

type SeedProduct = {
    slug: string;
    name: string;
    description: string;
    material: string;
    price: number;
    collections: Collection[];
    productType: ProductType;
    bestSeller: boolean;
    isNew: boolean;
    tone: number;
    image: string;
    imageAlt: string;
    tryOnCategory: "upper_body" | "lower_body" | "dresses";
    tryOnPhotoType: "model" | "flat-lay" | null;
    variants: { size: string; stock: number }[];
};

const products: SeedProduct[] = [
    {
        slug: "kebaya-encim-modern",
        name: "Kebaya Encim Modern",
        collections: [Collection.KEBAYA, Collection.BARU],
        productType: ProductType.SINGLE,
        bestSeller: true,
        isNew: true,
        price: 685000,
        tone: 300,
        image: "/products/kebaya-encim-modern.jpg",
        imageAlt: "Kebaya encim biru dengan kain merah di atas manekin",
        description:
            "Potongan kebaya encim dengan lengan tiga per empat dan bukaan depan. Dijahit rapi dengan furing penuh agar nyaman dipakai seharian.",
        material: "Brokat tenun, furing katun",
        tryOnCategory: "upper_body",
        tryOnPhotoType: "model",
        variants: [
            { size: "S", stock: 8 },
            { size: "M", stock: 10 },
            { size: "L", stock: 8 },
            { size: "XL", stock: 4 },
        ],
    },
    {
        slug: "batik-kawung-selendang",
        name: "Batik Kawung Selendang",
        collections: [Collection.BATIK],
        productType: ProductType.SINGLE,
        bestSeller: false,
        isNew: false,
        price: 425000,
        tone: 400,
        image: "/products/batik-kawung-selendang.jpg",
        imageAlt: "Detail motif batik kawung berwarna cokelat dan krem",
        description:
            "Selendang batik tulis dengan motif kawung. Pewarna alami, tepi dijahit tangan.",
        material: "Katun primisima",
        tryOnCategory: "upper_body",
        tryOnPhotoType: null,
        variants: [{ size: "All size", stock: 6 }],
    },
    {
        slug: "lurik-linen-set",
        name: "Lurik Linen Set",
        collections: [Collection.BARU],
        productType: ProductType.SINGLE,
        bestSeller: false,
        isNew: true,
        price: 549000,
        tone: 200,
        image: "/products/lurik-linen-set.jpg",
        imageAlt: "Tumpukan kain tenun lurik dengan warna alami",
        description:
            "Set atasan dan rok dari linen lurik. Siluet longgar, cocok untuk acara siang.",
        material: "Linen lurik",
        tryOnCategory: "dresses",
        tryOnPhotoType: null,
        variants: [
            { size: "S", stock: 5 },
            { size: "M", stock: 6 },
            { size: "L", stock: 4 },
        ],
    },
    {
        slug: "kebaya-kutubaru",
        name: "Kebaya Kutubaru",
        collections: [Collection.KEBAYA],
        productType: ProductType.SINGLE,
        bestSeller: false,
        isNew: false,
        price: 725000,
        tone: 300,
        image: "/products/kebaya-kutubaru.jpg",
        imageAlt: "Detail bordir merah pada kebaya",
        description:
            "Kebaya kutubaru dengan bef dan kancing tempel. Garis leher dibuat tangan.",
        material: "Brokat, furing sifon",
        tryOnCategory: "upper_body",
        tryOnPhotoType: "model",
        variants: [
            { size: "S", stock: 6 },
            { size: "M", stock: 7 },
            { size: "L", stock: 3 },
        ],
    },
    {
        slug: "blouse-tenun-sumba",
        name: "Blouse Tenun Sumba",
        collections: [Collection.BARU],
        productType: ProductType.SINGLE,
        bestSeller: false,
        isNew: false,
        price: 495000,
        tone: 400,
        image: "/products/blouse-tenun-sumba.jpg",
        imageAlt: "Kain tenun ikat dengan motif geometris",
        description:
            "Blouse dari tenun ikat Sumba dengan potongan lurus dan lengan balon.",
        material: "Tenun ikat",
        tryOnCategory: "upper_body",
        tryOnPhotoType: null,
        variants: [
            { size: "S", stock: 7 },
            { size: "M", stock: 5 },
            { size: "L", stock: 4 },
        ],
    },
    {
        slug: "batik-tulis-parang",
        name: "Batik Tulis Parang",
        collections: [Collection.BATIK],
        productType: ProductType.SINGLE,
        bestSeller: true,
        isNew: false,
        price: 890000,
        tone: 500,
        image: "/products/batik-tulis-parang.jpg",
        imageAlt: "Kain batik tulis motif parang",
        description:
            "Kain batik tulis motif parang. Satu lembar, satu warna, tidak ada duplikat.",
        material: "Katun primisima",
        tryOnCategory: "lower_body",
        tryOnPhotoType: null,
        variants: [{ size: "2m x 1m", stock: 2 }],
    },
    {
        slug: "outer-tenun-ikat",
        name: "Outer Tenun Ikat",
        collections: [Collection.BARU, Collection.BATIK],
        productType: ProductType.SINGLE,
        bestSeller: false,
        isNew: true,
        price: 610000,
        tone: 300,
        image: "/products/outer-tenun-ikat.jpg",
        imageAlt: "Outer tenun ikat gelap yang dikenakan dari belakang",
        description:
            "Outer tanpa kancing dari tenun ikat. Dipakai terbuka di atas kebaya atau kaus.",
        material: "Tenun ikat, tanpa furing",
        tryOnCategory: "upper_body",
        tryOnPhotoType: "model",
        variants: [{ size: "All size", stock: 4 }],
    },
    {
        slug: "kebaya-brokat",
        name: "Kebaya Brokat",
        collections: [Collection.KEBAYA],
        productType: ProductType.SINGLE,
        bestSeller: true,
        isNew: false,
        price: 960000,
        tone: 200,
        image: "/products/kebaya-brokat.jpg",
        imageAlt: "Kebaya putih dengan kain batik di museum",
        description:
            "Kebaya brokat dengan bordir halus di bagian lengan dan ujung kebaya.",
        material: "Brokat bordir, furing satin",
        tryOnCategory: "upper_body",
        tryOnPhotoType: "model",
        variants: [
            { size: "S", stock: 4 },
            { size: "M", stock: 5 },
            { size: "L", stock: 3 },
            { size: "XL", stock: 2 },
        ],
    },
];

async function seedUsers() {
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@boutique.local").toLowerCase();
    const customerEmail = (
        process.env.CUSTOMER_EMAIL ?? "pelanggan@boutique.local"
    ).toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const customerPassword = process.env.CUSTOMER_PASSWORD;

    if (!adminPassword || !customerPassword) {
        throw new Error(
            "Set ADMIN_PASSWORD and CUSTOMER_PASSWORD in .env before running the seed.",
        );
    }

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: "Admin Boutique NC",
            passwordHash: await hashPassword(adminPassword),
            role: Role.ADMIN,
        },
        create: {
            email: adminEmail,
            name: "Admin Boutique NC",
            passwordHash: await hashPassword(adminPassword),
            role: Role.ADMIN,
        },
    });

    await prisma.user.upsert({
        where: { email: customerEmail },
        update: {
            name: "Pelanggan Demo",
            passwordHash: await hashPassword(customerPassword),
            role: Role.CUSTOMER,
        },
        create: {
            email: customerEmail,
            name: "Pelanggan Demo",
            passwordHash: await hashPassword(customerPassword),
            role: Role.CUSTOMER,
        },
    });

    console.log(`Admin    : ${adminEmail} / ${adminPassword}`);
    console.log(`Pelanggan: ${customerEmail} / ${customerPassword}`);
}

async function main() {
    await seedUsers();

    for (const product of products) {
        const data = {
            name: product.name,
            description: product.description,
            material: product.material,
            price: product.price,
            collections: product.collections,
            productType: product.productType,
            bestSeller: product.bestSeller,
            isNew: product.isNew,
            tone: product.tone,
            image: product.image,
            imageAlt: product.imageAlt,
            tryOnCategory: product.tryOnCategory,
            tryOnPhotoType: product.tryOnPhotoType,
            active: true,
        };

        const variants = product.variants.map((variant, index) => ({
            ...variant,
            sortOrder: index,
        }));

        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {
                ...data,
                variants: {
                    deleteMany: {},
                    create: variants,
                },
            },
            create: {
                ...data,
                slug: product.slug,
                variants: {
                    create: variants,
                },
            },
        });
    }

    await prisma.siteImage.upsert({
        where: { key: "hero" },
        update: {},
        create: {
            key: "hero",
            image: "/hero-kebaya.jpg",
            imageAlt: "Model memakai kebaya dengan kain batik",
        },
    });

    await prisma.siteImage.upsert({
        where: { key: "story" },
        update: {},
        create: {
            key: "story",
            image: "/artisan-batik.jpg",
            imageAlt: "Perajin sedang mengerjakan kain batik",
        },
    });

    console.log(`Seeded ${products.length} products.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
