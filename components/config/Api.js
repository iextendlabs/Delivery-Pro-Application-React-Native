const BaseUrl = 'https://services.upgradeopencart.com/';

const OrderUrl = BaseUrl+'appOrders?';
const LoginUrl = BaseUrl+'appUser?';
const OrderCommentUrl = BaseUrl+'appAddOrderComment/';
const OrderCashCollectionUrl = BaseUrl+'appCashCollection/';
const OrderStatusUpdateUrl = BaseUrl+'appOrderStatusUpdate/';
const RescheduleUrl = BaseUrl+'appRescheduleOrder/';
const TimeSlotsUrl = BaseUrl+'appTimeSlots?';

export {
    OrderUrl, LoginUrl, OrderCommentUrl, RescheduleUrl, OrderStatusUpdateUrl, BaseUrl,TimeSlotsUrl,OrderCashCollectionUrl
}