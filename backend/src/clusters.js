// Deterministic Lloyd's algorithm. Empty tiers retain their centroid and count 0.
// At most 100 iterations; dividing before summing avoids overflow of salary sums.
function KripTop_runKMeans(KripTop_salaries) {
  if (!KripTop_salaries.length) {
    return { clusters: [1, 2, 3].map(KripTop_tier => ({ group: `Tier ${KripTop_tier}`, centroid: 0, count: 0 })), memberships: [] };
  }
  const KripTop_sorted = KripTop_salaries.map((KripTop_salary, KripTop_index) => ({ salary: KripTop_salary, index: KripTop_index })).sort((KripTop_a, KripTop_b) => KripTop_a.salary - KripTop_b.salary);
  let KripTop_centroids = [KripTop_sorted[0].salary, KripTop_sorted[Math.floor((KripTop_sorted.length - 1) / 2)].salary, KripTop_sorted.at(-1).salary];
  let KripTop_groups;
  for (let KripTop_iteration = 0; KripTop_iteration < 100; KripTop_iteration++) {
    KripTop_groups = [[], [], []];
    for (const KripTop_item of KripTop_sorted) {
      const KripTop_salary = KripTop_item.salary;
      let KripTop_nearest = 0;
      for (let KripTop_index = 1; KripTop_index < 3; KripTop_index++) {
        if (Math.abs(KripTop_salary - KripTop_centroids[KripTop_index]) < Math.abs(KripTop_salary - KripTop_centroids[KripTop_nearest])) KripTop_nearest = KripTop_index;
      }
      KripTop_groups[KripTop_nearest].push(KripTop_item);
    }
    const KripTop_next = KripTop_groups.map((KripTop_group, KripTop_index) => KripTop_group.length
      ? KripTop_group.reduce((KripTop_sum, KripTop_value) => KripTop_sum + KripTop_value.salary / KripTop_group.length, 0)
      : KripTop_centroids[KripTop_index]);
    const KripTop_done = KripTop_next.every((KripTop_value, KripTop_index) => KripTop_value === KripTop_centroids[KripTop_index]);
    KripTop_centroids = KripTop_next;
    if (KripTop_done) break;
  }
  const KripTop_order = KripTop_centroids.map((KripTop_centroid, KripTop_index) => ({ centroid: KripTop_centroid, source: KripTop_index }))
    .sort((KripTop_a, KripTop_b) => KripTop_a.centroid - KripTop_b.centroid);
  const KripTop_memberships = Array(KripTop_salaries.length);
  const KripTop_clusters = KripTop_order.map((KripTop_cluster, KripTop_index) => {
    const KripTop_group = `Tier ${KripTop_index + 1}`;
    for (const KripTop_item of KripTop_groups[KripTop_cluster.source]) KripTop_memberships[KripTop_item.index] = KripTop_group;
    return { group: KripTop_group, centroid: KripTop_cluster.centroid, count: KripTop_groups[KripTop_cluster.source].length };
  });
  return { clusters: KripTop_clusters, memberships: KripTop_memberships };
}

export function KripTop_clusterSalaries(KripTop_salaries) {
  return KripTop_runKMeans(KripTop_salaries).clusters;
}

// Return the algorithm's actual final memberships, including duplicate/tied values.
export function KripTop_analyzeEmployees(KripTop_employees) {
  const KripTop_result = KripTop_runKMeans(KripTop_employees.map(KripTop_employee => KripTop_employee.salary));
  return {
    clusters: KripTop_result.clusters,
    assignments: KripTop_employees.map((KripTop_employee, KripTop_index) => ({ id: KripTop_employee.id, group: KripTop_result.memberships[KripTop_index], salary: KripTop_employee.salary })),
    employees: KripTop_employees,
    generatedAt: new Date().toISOString(),
  };
}
