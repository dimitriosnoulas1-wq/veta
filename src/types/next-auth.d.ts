import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: "MEMBER" | "ADMIN";
      planCode: "BASIC" | "PRO" | "ELITE" | "VIP" | null;
      status: "FREE" | "PAID_PENDING" | "PAID" | "EXPIRED";
      firstName: string;
      username: string;
    };
  }
}
