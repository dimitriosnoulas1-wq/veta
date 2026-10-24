import { PrismaClient, PlanCode, ProductKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ACTIVE_UNTIL, COURSES, NOTIFY_WHATSAPP, PLANS, POSITIONING, allProducts } from "../src/content/catalog";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.DEMO_PASSWORD;
  if (!password) throw new Error("DEMO_PASSWORD is required");
  const passwordHash = await bcrypt.hash(password, 10);

  for (const plan of PLANS) {
    const { code, ...rest } = plan;
    await prisma.plan.upsert({
      where: { code },
      update: rest,
      create: plan,
    });
  }

  for (const product of allProducts()) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: { ...product, kind: product.kind as ProductKind },
    });
  }

  for (const course of COURSES) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {
        academy: course.academy,
        title: course.title,
        access: course.access,
        summary: course.summary ?? "",
        modules: course.modules,
        sort: course.sort,
      },
      create: {
        id: course.id,
        academy: course.academy,
        title: course.title,
        access: course.access,
        summary: course.summary ?? "",
        modules: course.modules,
        sort: course.sort,
      },
    });
    const existing = await prisma.lesson.count({ where: { courseId: course.id } });
    if (existing === 0) {
      const videos = course.videos ?? [];
      const count = Math.max(course.modules, videos.length, 1);
      for (let i = 0; i < count; i++) {
        const videoId = videos[i];
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            position: i + 1,
            title: videos.length > 1 ? `Video ${i + 1}` : course.modules > 1 ? `Module ${i + 1}` : course.title,
            videoId: videoId ?? null,
            note: course.summary ?? "",
          },
        });
      }
    }
  }

  const demo = await prisma.user.upsert({
    where: { email: "demo@localhost" },
    update: {},
    create: {
      email: "demo@localhost",
      username: "demo",
      passwordHash,
      firstName: "Dimitrios",
      lastName: "Noulas",
      role: "MEMBER",
      planCode: "BASIC",
      status: "PAID",
      activeUntil: new Date(ACTIVE_UNTIL),
      balanceCents: 0,
      adCredits: 1000,
      autoRenew: true,
      language: "en",
      sponsorUsername: "vate",
      notifications: { create: {} },
      messengers: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@localhost" },
    update: {},
    create: {
      email: "admin@localhost",
      username: "admin",
      passwordHash,
      firstName: "Admin",
      lastName: "",
      role: "ADMIN",
      planCode: "VIP",
      status: "PAID",
      language: "en",
    },
  });

  const payment = await prisma.payment.findFirst({ where: { userId: demo.id, description: "Membership upgrade ( Basic )" } });
  if (!payment) {
    await prisma.payment.create({
      data: {
        userId: demo.id,
        amountCents: 2500,
        method: "CRYPTO",
        status: "PAID",
        description: "Membership upgrade ( Basic )",
        createdAt: new Date("2026-10-16T07:06:31.000Z"),
      },
    });
  }

  const ticket = await prisma.ticket.findUnique({ where: { number: "80852738" } });
  if (!ticket) {
    await prisma.ticket.create({
      data: {
        number: "80852738",
        userId: demo.id,
        department: "Support",
        subject: "Deposit",
        status: "CLOSED",
        createdAt: new Date("2026-10-16T07:06:31.000Z"),
      },
    });
  }

  const meeting = await prisma.calendarEvent.findFirst({ where: { href: POSITIONING.meet } });
  if (!meeting) {
    await prisma.calendarEvent.create({
      data: {
        title: "Your Daily LIVE Meeting",
        when: POSITIONING.dailyCall,
        href: POSITIONING.meet,
        note: "Multi-Language Meetings",
      },
    });
  }

  void NOTIFY_WHATSAPP;
  void PlanCode;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
