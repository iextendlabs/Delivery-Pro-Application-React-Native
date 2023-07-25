const BaseUrl = 'https://localhost/';

const OrderUrl = BaseUrl+'appOrders?';
const LoginUrl = BaseUrl+'appUser?';
const OrderCommentUrl = BaseUrl+'appAddOrderComment/';
const ApprovedUrl = BaseUrl+'appRescheduleOrder/';
const DeclineUrl = BaseUrl+'appRescheduleOrder/';
const RescheduleUrl = BaseUrl+'reschedule';
export {
    OrderUrl, LoginUrl, OrderCommentUrl, RescheduleUrl, ApprovedUrl, DeclineUrl, BaseUrl
}