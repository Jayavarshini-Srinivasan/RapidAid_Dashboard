import { StyleSheet } from "react-native";

export default StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  headerBar: {
    backgroundColor: "#218c74",
    paddingTop: 38,
    paddingBottom: 16,
    paddingHorizontal: 21,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  assignedTag: {
    color: "#0af435ff",
    fontSize: 18,
    fontWeight: "bold",
  },

  
  emergencyId: {
    color: "#ebe7f3ff",
    fontSize: 13,
    marginTop: 2,
  },
 
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    paddingVertical: 18,
    paddingHorizontal: 14,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    backgroundColor: "#e3e3e3",
    width: 56, height: 56,
    borderRadius: 28,
    marginRight: 15,
  },
  infoArea: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#333",
  },
  subTitle: {
    fontSize: 13,
    color: "#ababab",
  },
  rating: {
    flexDirection: "row",
    marginTop: 4,
  },
  star: {
    color: "#ffb200",
    fontSize: 16,
    marginRight: 1,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: "#2979ff",
    borderRadius: 8,
    flex: 1,
    marginRight: 7,
    alignItems: "center",
    padding: 12,
  },
  chatButton: {
    backgroundColor: "#21be61",
    borderRadius: 8,
    flex: 1,
    marginLeft: 7,
    alignItems: "center",
    padding: 12,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  familyShare: {
    backgroundColor: "#a259ff",
    borderRadius: 10,
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
  },
  familyShareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginTop:15,
    marginHorizontal: 11,
    marginBottom: 17,
    elevation: 3,
    shadowColor: '#AAA',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontWeight: 'bold', 
    color: '#1D3557', 
    fontSize: 13, 
    marginBottom: 2
  },
  locText: {
    fontSize: 16,
    color: "#212121",
  },
});
