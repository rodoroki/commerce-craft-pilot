import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";
import { StoreLayout } from "@/components/store/chrome";

export const Route = createFileRoute("/_store")({
  component: StoreShell,
});

function StoreShell() {
  return (
    <CartProvider>
      <StoreLayout>
        <Outlet />
      </StoreLayout>
    </CartProvider>
  );
}
