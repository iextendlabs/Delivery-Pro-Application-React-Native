const OrderListStyle = {
  OrderLinks: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#0d6efd",
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  icons: {
    paddingRight: 15,
  },
  container: {
    backgroundColor: "#e4fbfb",
    flex: 1,
    paddingTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderContainer: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
    flexDirection: "column",
  },
  orderContainerOrange: {
    padding: 10,
    backgroundColor: "#fff3b4",
    marginBottom: 10,
    flexDirection: "column",
  },

  orderContainerGreen: {
    padding: 10,
    backgroundColor: "#c7ffcb",
    marginBottom: 10,
    flexDirection: "column",
  },

  orderContainerBlue: {
    padding: 10,
    backgroundColor: "#d7e6fb",
    marginBottom: 10,
    flexDirection: "column",
  },
  //
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  orderDetails: {
    marginBottom: 15,
  },
  detailBox: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailBoxTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailBoxText: {
    fontSize: 16,
  },
  phoneNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneNumber: {
    marginLeft: 10,
  },
  shippingAddressBox: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addressLineContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressLine: {
    fontSize: 16,
    marginRight: 5,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  commentText: {
    fontSize: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#24235D",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  noItemsText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  commentContainer: {
    marginTop: 20,
  },
  descriptionContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  amountInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#24235D",
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  successMessage: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fileInputContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  fileInputText: {
    fontSize: 16,
    color: "#333",
  },
  selectedImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    marginTop: 10,
  },
  userMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  otherMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  messageBubble: {
    backgroundColor: "#DCF8C6", // You can customize the background color of the message bubble
    padding: 10,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
  },
  messageRole: {
    fontSize: 12,
    color: "#8f9193",
  },
  chatModalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    flex: 1,
    flexDirection: "column",
  },
  attachmentsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  attachmentImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
    resizeMode: "cover",
  },
  imageGalleryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  closeImageGalleryButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 20,
  },
  closeImageGalleryButtonText: {
    color: "white",
    fontSize: 16,
  },
};

export default OrderListStyle;
