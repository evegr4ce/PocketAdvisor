type MetricCardProps = {
  title: string;
  value: string;
};

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl p-5 bg-white shadow-sm">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}