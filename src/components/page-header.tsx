export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight font-headline">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
