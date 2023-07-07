import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import clsx from 'clsx';
import { removeItem, updateItemQuantity } from 'components/cart/actions';
import MinusIcon from 'components/icons/minus';
import PlusIcon from 'components/icons/plus';
import LoadingDots from 'components/loading-dots';
import type { CartItem } from 'lib/shopify/types';

export default function EditItemQuantityButton({
  item,
  type
}: {
  item: CartItem;
  type: 'plus' | 'minus';
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
      onClick={() => {
        startTransition(async () => {
          const error =
            type === 'minus' && item.quantity - 1 === 0
              ? await removeItem(item.id)
              : await updateItemQuantity({
                  lineId: item.id,
                  variantId: item.merchandise.id,
                  quantity: type === 'plus' ? item.quantity + 1 : item.quantity - 1
                });

          if (error) {
            alert(error);
            return;
          }

          router.refresh();
        });
      }}
      disabled={isPending}
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-gray-800 hover:opacity-80',
        {
          'cursor-not-allowed': isPending,
          'ml-auto': type === 'minus'
        }
      )}
    >
      {isPending ? (
        <LoadingDots className="bg-black dark:bg-white" />
      ) : type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-base-gray-900" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-base-gray-900" />
      )}
    </button>
  );
}
