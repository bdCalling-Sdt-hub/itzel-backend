import { StatusCodes } from 'http-status-codes';
import { Subscription } from '../app/modules/subscription/subscription.model';
import Stripe from 'stripe';
import ApiError from '../errors/ApiError';
import { User } from '../app/modules/user/user.model';

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
  try {
    // Use a single query to find and update the subscription
    const isExistSubscription = await Subscription.findOne({
      subscriptionId: data.id,
    });
    if (!isExistSubscription) {
      return {
        subscription: null,
        user: null,
      };
    }
    const updatedSubscription = await Subscription.findOneAndUpdate(
      {
        subscriptionId: data.id,
        status: 'active',
      },
      { status: data.status },
      { new: true }
    );

    if (!updatedSubscription) {
      console.log(`Subscription with ID: ${data.id} not deleted.`);
      return {
        subscription: null,
        user: null,
      };
    }

    // Use a single query to find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      updatedSubscription.user,
      {
        isSubscribed: data.status === 'active' || data.status === 'incomplete',
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `User with ID: ${updatedSubscription.user} not found.`
      );
    }

    return {
      subscription: updatedSubscription,
      user: updatedUser,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error processing subscription deletion'
    );
  }
};
