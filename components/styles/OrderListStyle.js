const OrderListStyle = {
    OrderLinks:{
      flex:1,
      flexDirection:"row",
      alignItems: 'center',
    },
    icons:{
      paddingRight:10
    },
    container: {
      flex: 1,
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
      marginBottom: 5,
      textAlign: "center",
    },
    closeButton: {
      alignSelf: "flex-end",
      backgroundColor: "#9ac4f8",
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
      backgroundColor: "#9ac4f8",
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
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
  };

  export default OrderListStyle;