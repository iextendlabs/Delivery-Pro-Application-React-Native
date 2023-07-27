const OrderListStyle = {
  OrderLinks:{
    flex:1,
    flexDirection:"row",
    alignItems: 'center',
    paddingTop: 12
  },
  icons:{
    paddingRight:10
  },
  container: {
    flex: 1,
    paddingTop: 10
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
    flexDirection: "row",
  },
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
  orderText: {
    fontSize: 16,
    marginBottom: 0,
    textAlign: "center",
    color: 'black'
  },
  // New styles for the boxes
  detailBox: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailBoxText: {
    fontSize: 16,
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    marginLeft: 10,
  },
  shippingAddressBox: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addressLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLine: {
    fontSize: 16,
    marginRight: 5,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginVertical: 5,
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
  scrollContainer: {
    flexGrow: 1,
  },
  commentContainer: {
    marginTop: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  commentInput: {
    height: 100,
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
  acceptButton: {
    backgroundColor: "#198754",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: "#01AF94",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  rejectButton: {
    backgroundColor: "#C20D20",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
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
};

export default OrderListStyle;