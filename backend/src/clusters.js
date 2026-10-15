// Deterministic Lloyd's algorithm. Empty tiers retain their centroid and count 0.
// At most 100 iterations; dividing before summing avoids overflow of salary sums.
export function KripTop_clusterSalaries(KripTop_salaries) {
  if (!KripTop_salaries.length) {
    return [1, 2, 3].map(KripTop_tier => ({ group: `Tier ${KripTop_tier}`, centroid: 0, count: 0 }));
  }
  const KripTop_sorted = [...KripTop_salaries].sort((KripTop_a, KripTop_b) => KripTop_a - KripTop_b);
  let KripTop_centroids = [KripTop_sorted[0], KripTop_sorted[Math.floor((KripTop_sorted.length - 1) / 2)], KripTop_sorted.at(-1)];
  let KripTop_groups;
  for (let KripTop_iteration = 0; KripTop_iteration < 100; KripTop_iteration++) {
    KripTop_groups = [[], [], []];
    for (const KripTop_salary of KripTop_sorted) {
      let KripTop_nearest = 0;
      for (let KripTop_index = 1; KripTop_index < 3; KripTop_index++) {
        if (Math.abs(KripTop_salary - KripTop_centroids[KripTop_index]) < Math.abs(KripTop_salary - KripTop_centroids[KripTop_nearest])) KripTop_nearest = KripTop_index;
      }
      KripTop_groups[KripTop_nearest].push(KripTop_salary);
    }
    const KripTop_next = KripTop_groups.map((KripTop_group, KripTop_index) => KripTop_group.length
      ? KripTop_group.reduce((KripTop_sum, KripTop_value) => KripTop_sum + KripTop_value / KripTop_group.length, 0)
      : KripTop_centroids[KripTop_index]);
    const KripTop_done = KripTop_next.every((KripTop_value, KripTop_index) => KripTop_value === KripTop_centroids[KripTop_index]);
    KripTop_centroids = KripTop_next;
    if (KripTop_done) break;
  }
  return KripTop_centroids.map((KripTop_centroid, KripTop_index) => ({ centroid: KripTop_centroid, count: KripTop_groups[KripTop_index].length }))
    .sort((KripTop_a, KripTop_b) => KripTop_a.centroid - KripTop_b.centroid)
    .map((KripTop_cluster, KripTop_index) => ({ group: `Tier ${KripTop_index + 1}`, ...KripTop_cluster }));
}
