import {
  deleteReport,
  listenReports,
  updateReportPriority,
  updateReportStatus,
} from "@/src/services/reportService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Chip, Text } from "react-native-paper";

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const unsubscribe = listenReports((data) => {
      setReports(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredReports =
    filter === "All"
      ? reports
      : reports.filter((report) => report.status === filter);

  const handleDelete = (reportId: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteReport(reportId);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Reports & Feedback 🚨</Text>
      </View>

      <Text style={styles.subtitle}>
        Review user reports, feedback, bugs, and platform issues.
      </Text>

      <View style={styles.filterRow}>
        {["All", "Pending", "In Review", "Resolved", "Dismissed"].map(
          (item) => (
            <Chip
              key={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.activeChip]}
              textStyle={
                filter === item ? styles.activeChipText : styles.chipText
              }
            >
              {item}
            </Chip>
          ),
        )}
      </View>

      {filteredReports.length === 0 ? (
        <Text style={styles.empty}>No reports found.</Text>
      ) : (
        filteredReports.map((report) => (
          <View key={report.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportTitle}>{report.title}</Text>

                <Text style={styles.reportType}>
                  {report.type} • {report.priority}
                </Text>
              </View>

              <Text
                style={[
                  styles.status,
                  report.status === "Resolved" && styles.resolved,
                  report.status === "In Review" && styles.inReview,
                  report.status === "Dismissed" && styles.dismissed,
                ]}
              >
                {report.status}
              </Text>
            </View>

            <Text style={styles.description}>{report.description}</Text>

            <Text style={styles.meta}>Reported by: {report.reportedBy}</Text>

            <Text style={styles.meta}>
              Created:{" "}
              {report.createdAt?.toDate?.().toLocaleDateString() ?? "-"}
            </Text>

            {report.relatedItemType && (
              <Text style={styles.meta}>Related: {report.relatedItemType}</Text>
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                compact
                onPress={() => updateReportStatus(report.id, "In Review")}
              >
                Review
              </Button>

              <Button
                mode="outlined"
                compact
                onPress={() => updateReportStatus(report.id, "Resolved")}
              >
                Resolve
              </Button>

              <Button
                mode="outlined"
                compact
                onPress={() => updateReportStatus(report.id, "Dismissed")}
              >
                Dismiss
              </Button>

              <Button
                mode="outlined"
                compact
                onPress={() => updateReportPriority(report.id, "Low")}
              >
                Low
              </Button>

              <Button
                mode="outlined"
                compact
                onPress={() => updateReportPriority(report.id, "Medium")}
              >
                Medium
              </Button>

              <Button
                mode="outlined"
                compact
                onPress={() => updateReportPriority(report.id, "High")}
              >
                High
              </Button>
            </View>

            <Button
              mode="text"
              textColor="#EF4444"
              onPress={() => handleDelete(report.id)}
            >
              Delete Report
            </Button>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#F3F4F6",
  },
  activeChip: {
    backgroundColor: "#8B5CF6",
  },
  chipText: {
    color: "#333",
  },
  activeChipText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#F8F5FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  reportType: {
    color: "#8B5CF6",
    marginTop: 4,
    fontWeight: "600",
  },
  status: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
    overflow: "hidden",
  },
  resolved: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  inReview: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
  },
  description: {
    marginTop: 12,
    color: "#374151",
    lineHeight: 20,
  },
  meta: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  dismissed: {
    backgroundColor: "#F3F4F6",
    color: "#374151",
  },
});
