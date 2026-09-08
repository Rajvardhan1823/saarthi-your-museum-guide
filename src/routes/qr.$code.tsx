import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getExhibit } from "@/lib/museums";

/** Physical QR codes encode /qr/<code> and resolve to the exhibit page. */
export const Route = createFileRoute("/qr/$code")({
  loader: ({ params }) => {
    const found = getExhibit(params.code.toLowerCase());
    if (!found) throw notFound();
    throw redirect({ to: "/exhibit/$id", params: { id: found.exhibit.id } });
  },
});
