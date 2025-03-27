const BidStyle = {
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
  },
  bidForm: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  previewImageWrapper: {
    position: "relative",
    margin: 5,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fullScreenImage: {
    width: "90%",
    height: "90%",
  },
  navigationButtons: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  chatBox: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop:16
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "75%",
  },
  senderMessage: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
  },
  receiverMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageText: {
    fontSize: 14,
  },
  senderName: {
    fontWeight: "bold",
  },
  linkText: {
    color: "#007bff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  attachmentButton: {
    padding: 10,
    marginRight: 8,
  },
  chatInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  header: {
    backgroundColor: "#28a745",
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
  bidContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bidTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bidDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  bidLabel: {
    fontWeight: "bold",
  },
  bidImagesContainer: {
    marginTop: 8,
  },
  bidImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
};

export default BidStyle;
