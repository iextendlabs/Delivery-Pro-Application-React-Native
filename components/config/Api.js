const BaseUrl = "https://lipslay.com/";

const IndexUrl = BaseUrl + "api/index?";
const OrderUrl = BaseUrl + "api/ordersV2?";
const LoginUrl = BaseUrl + "api/login";
const OrderCommentUrl = BaseUrl + "api/addOrderComment";
const OrderCashCollectionUrl = BaseUrl + "api/cashCollection";
const OrderStatusUpdateUrl = BaseUrl + "api/orderStatusUpdate";
const DriverOrderStatusUpdateUrl = BaseUrl + "api/driverOrderStatusUpdate";
const RescheduleUrl = BaseUrl + "api/rescheduleOrder";
const TimeSlotsUrl = BaseUrl + "api/timeSlots?";
const OrderChatUrl = BaseUrl + "api/orderChat?";
const AddOrderChatUrl = BaseUrl + "api/addOrderChat";
const NotificationUrl = BaseUrl + "api/notification?";
const ShortHolidayURL = BaseUrl + "api/addShortHoliday";
const GetTransactionsUrl = BaseUrl + "api/getTransactions?";
const GetHolidaysUrl = BaseUrl + "api/getHolidays?";
const GetStaffOrdersUrl = BaseUrl + "api/getStaffOrders?";
const GetWithdrawPaymentMethodsUrl = BaseUrl + "api/getWithdrawPaymentMethods?";
const WithdrawUrl = BaseUrl + "api/withdraw";
const GetWithdrawsUrl = BaseUrl + "api/getWithdraws?";
const updateProfileUrl = BaseUrl + "api/updateProfile";
const onlineOfflineUrl = BaseUrl + "api/onlineOffline";
const createPaymentIntent = BaseUrl + "api/create-payment-intent";
const getPlansUrl = BaseUrl + "api/getPlans?";
const SignupUrl = BaseUrl + "api/staffSignup";
const getQuotesUrl = BaseUrl + "api/getStaffQuotes?";
const quoteStatusUpdateUrl = BaseUrl + "api/quotes/update-status";

const stripe_publishable_key = "pk_test_51OrKDSLOkaB2VOci1EiX49C8YbaO8tNF1EUx8BEtdQkBDOKuHM7pvpKhs1mipwX2igoyLhwCq65xz7SHkZAfmW5B00XcTqrdg6";

// const stripe_publishable_key = "pk_live_51OrKDSLOkaB2VOcifspcDKluVndJMmPogfgJZnpQY49Ejb0iykwEdjYygo7WVDjPUvma4y84a8xveeg9dnG6nEG300b0vXwIsR";
export {
  OrderUrl,
  LoginUrl,
  OrderCommentUrl,
  RescheduleUrl,
  OrderStatusUpdateUrl,
  BaseUrl,
  TimeSlotsUrl,
  OrderCashCollectionUrl,
  DriverOrderStatusUpdateUrl,
  OrderChatUrl,
  AddOrderChatUrl,
  NotificationUrl,
  ShortHolidayURL,
  IndexUrl,
  GetTransactionsUrl,
  GetHolidaysUrl,
  GetStaffOrdersUrl,
  GetWithdrawPaymentMethodsUrl,
  WithdrawUrl,
  GetWithdrawsUrl,
  updateProfileUrl,
  onlineOfflineUrl,
  stripe_publishable_key,
  createPaymentIntent,
  getPlansUrl,
  SignupUrl,
  getQuotesUrl,
  quoteStatusUpdateUrl
};
