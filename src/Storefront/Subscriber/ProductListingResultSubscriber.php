<?php declare(strict_types=1);

namespace MoorlFoundation\Storefront\Subscriber;

use MoorlFoundation\Core\Service\EntitySearchService;
use MoorlFoundation\Core\Service\EntitySuggestService;
use Shopware\Core\Content\Product\Events\ProductSearchResultEvent;
use Shopware\Core\Content\Product\Events\ProductSuggestResultEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ProductListingResultSubscriber implements EventSubscriberInterface
{
    private readonly EntitySuggestService $suggestService;

    public function __construct(
        private readonly EntitySearchService $searchService,
        EntitySuggestService $suggestService
    )
    {
        $this->suggestService = $suggestService;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            ProductSuggestResultEvent::class => 'onProductSuggestResultEvent',
            ProductSearchResultEvent::class => 'onProductSearchResultEvent',
        ];
    }

    public function onProductSuggestResultEvent(ProductSuggestResultEvent $event): void
    {
        $this->suggestService->enrich($event);
    }

    public function onProductSearchResultEvent(ProductSearchResultEvent $event): void
    {
        $this->searchService->enrich($event);
    }
}
