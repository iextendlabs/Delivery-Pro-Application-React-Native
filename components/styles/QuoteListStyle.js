const QuoteListStyle = {
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  quoteItem: {
    backgroundColor: "#e4fbfb",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  senderText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#fd245f",
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  noQuotesText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  centeredContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  success: {
    backgroundColor: "#28a745",
  },
  danger: {
    backgroundColor: "#dc3545",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statusButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusButton: {
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  quoteContainer: {
    flex: 1,
    backgroundColor: "#e4fbfb",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  linkText: {
    color: "#007bff",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 14,
    color: "#666",
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  imageGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  navButtonLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
    zIndex: 1,
  },
  navButtonRight: {
    position: "absolute",
    right: 20,
    top: "50%",
    zIndex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#FFCACC",
    marginVertical: 16,
  },
};

export default QuoteListStyle;
