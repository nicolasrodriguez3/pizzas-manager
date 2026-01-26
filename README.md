# 🍕 Pizza Manager & POS SaaS

![Pizza Manager Hero](./public/pizza_manager_hero.png)

A comprehensive, multi-tenant solution designed for pizza businesses to manage costs, production, and sales with a premium, state-of-the-art interface.

## ✨ Key Features

- **Multi-tenant SaaS**: Complete data isolation with secure user authentication.
- **Cost Management**: Granular control over ingredients, units, and costs.
- **Recipe Engineering**: Intelligent recipe building to calculate exact production costs and margins.
- **Dynamic POS**: A streamlined Point of Sale interface for recording sales instantly.
- **Financial Dashboard**: Real-time insights into revenue, production costs, and net profit.
- **Premium Design**: Modern Glassmorphism UI built with Tailwind CSS 4.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Authentication**: [NextAuth.js (Auth.js) v5](https://authjs.dev/)
- **Database**: [Prisma 7](https://www.prisma.io/) with SQLite
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Validation**: [Zod](https://zod.dev/)

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/nicolasrodriguez3/pizzas-manager.git
   cd my-app
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env` file and configure your database and authentication secrets:

   ```env
   DATABASE_URL="postgresql://costos_user:costos_pass@localhost:5432/costos"
   AUTH_SECRET="your-secret-here"
   ```

4. **Database Initialization**:

   ```bash
   pnpm db:up
   pnpm prisma migrate dev
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router (Routes, Actions, and Components)
- `prisma/`: Database schema and migrations
- `public/`: Static assets
- `generated/`: Generated Prisma client code
- `proxy.ts`: Authentication and route protection

---

Built with ❤️ for pizza entrepreneurs.
