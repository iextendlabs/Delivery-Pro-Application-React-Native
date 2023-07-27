const MainStyles = {
  container: {
    flex: 1,
  },
  screenText: {
    fontSize: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#1B3364',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerLink: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
  screenContainer: {
    justifyContent: 'center',
    flexDirection: 'row'
  },
  button: {
    fontSize: 15,
    paddingTop: 0,
    color: '#fff',
    backgroundColor: '#1B3364',
    borderRadius: 10,
    margin: 3,
    width: 80,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden', // Add this line to prevent the background color from expanding when pressed
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
};
export default MainStyles;