import Link from "next/link";
import { LogIn, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onNewNote: () => void;
}
export default function Header({ onNewNote }: HeaderProps) {
  return (
    <header className="border-b p-4 bg-card">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
        Delveinsight Notes
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
          <Button onClick={onNewNote} size="sm" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" /> New Note
          </Button>
        </div>
      </div>
    </header>
  );
}
