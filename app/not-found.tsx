import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-7xl font-bold tracking-tight text-primary">404</p>
        <h1 className="text-xl font-semibold">Sahifa topilmadi</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <Home className="h-4 w-4" />
          Bosh sahifaga qaytish
        </Link>
      </Button>
    </div>
  );
}
