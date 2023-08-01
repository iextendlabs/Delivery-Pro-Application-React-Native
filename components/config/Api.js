const BaseUrl = 'https://services.upgradeopencart.com/';

const OrderUrl = BaseUrl+'staffAppOrders?';
const LoginUrl = BaseUrl+'staffAppUser?';
const OrderCommentUrl = BaseUrl+'staffAppAddOrderComment/';
const OrderCashCollectionUrl = BaseUrl+'staffAppCashCollection/';
const OrderStatusUpdateUrl = BaseUrl+'staffAppOrderStatusUpdate/';
const RescheduleUrl = BaseUrl+'staffAppRescheduleOrder/';
const TimeSlotsUrl = BaseUrl+'staffAppTimeSlots?';

export {
    OrderUrl, LoginUrl, OrderCommentUrl, RescheduleUrl, OrderStatusUpdateUrl, BaseUrl,TimeSlotsUrl,OrderCashCollectionUrl
}