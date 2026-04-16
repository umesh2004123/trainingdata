import { useFavorites } from "@/hooks/use-favorites";
import { AppLayout } from "@/components/AppLayout";
import { TelltaleCard } from "@/components/TelltaleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" /> Favorites
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved telltales</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : !favorites?.length ? (
          <p className="text-sm text-muted-foreground text-center py-12">No favorites yet. Heart a telltale to save it here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((f) => f.telltales && (
              <TelltaleCard key={f.id} item={f.telltales as any} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
