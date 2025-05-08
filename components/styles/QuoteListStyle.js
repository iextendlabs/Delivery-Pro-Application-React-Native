const QuoteListStyle = {
  container: {
    flex: 1,
    backgroundColor: "#e4fbfb",
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
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: "#fd245f",
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
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
    margin: 8,
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bullet: {
    fontSize: 16,
    marginRight: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationText: {
    marginLeft: 3,
    fontSize: 14,
    color: "#333",
  },
  listContent: {
    paddingVertical: 8,
  },
  quoteCard: {
    backgroundColor: '#e4fbfb',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quoteContent: {
    flexDirection: 'row',
    padding: 16,
  },
  quoteServiceImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  quoteMain: {
    flex: 1,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quoteServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  quoteMeta: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  boldText: {
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusAccepted: {
    backgroundColor: '#cbffcd',
  },
  statusRejected: {
    backgroundColor: '#ffcbcb',
  },
  statusPending: {
    backgroundColor: '#dad8d8',
  },
  quoteStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bidWon: {
    backgroundColor: '#4caf50',
  },
  bidLost: {
    backgroundColor: '#f44336',
  },
  bidText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  actionBtn: {
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  chatBtn: {
    backgroundColor: '#4caf50',
  },
  chatBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  statusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  acceptBtn: {
    backgroundColor: '#4caf50',
  },
  rejectBtn: {
    backgroundColor: '#f44336',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignSelf: 'flex-end',
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  statusFilterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  statusOptionSelected: {
    backgroundColor: '#3498db',
  },
  statusOptionText: {
    color: '#333',
  },
  statusOptionTextSelected: {
    color: '#fff',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  dateRangeSeparator: {
    color: '#666',
  },
  todayFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3498db',
    backgroundColor: '#3498db',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayFilterText: {
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#3498db',
  },
  applyButtonText: {
    color: '#fff',
  },
  filterResultsText: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#666',
    fontSize: 12,
  },
  resetFilterText: {
    color: '#3498db',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
};

export default QuoteListStyle;
