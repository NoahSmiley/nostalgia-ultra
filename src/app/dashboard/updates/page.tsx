import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const updates = [
  {
    version: "v1.2.0",
    date: "November 20, 2024",
    changes: [
      "Added new spawn area with custom builds",
      "Implemented economy system",
      "New player homes feature",
      "Performance improvements",
    ],
  },
  {
    version: "v1.1.0",
    date: "November 10, 2024",
    changes: [
      "Added land claiming system",
      "New shop GUI",
      "Bug fixes for teleportation",
    ],
  },
  {
    version: "v1.0.0",
    date: "November 1, 2024",
    changes: [
      "Initial server launch",
      "Basic survival gameplay",
      "Discord integration",
    ],
  },
];

export default function UpdatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Updates</h1>
        <p className="text-zinc-400 mt-1">Changelog and server updates</p>
      </div>

      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.version} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-400">{update.version}</CardTitle>
                <span className="text-sm text-zinc-500">{update.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {update.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-zinc-600 mt-1.5">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
