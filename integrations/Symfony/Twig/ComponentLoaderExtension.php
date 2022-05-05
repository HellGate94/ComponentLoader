<?php

namespace App\Twig;

use Symfony\Component\Serializer\Encoder\EncoderInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class ComponentLoaderExtension extends AbstractExtension
{
    private SerializerInterface $serializer;

    public function __construct(SerializerInterface $serializer)
    {
        $this->serializer = $serializer;
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters(): array
    {
        return [
            new TwigFilter('compdata', [$this, 'compDataFilter']),
            new TwigFilter('compData', [$this, 'compDataFilter']),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions(): array
    {
        return [
            new TwigFunction('compdata', [$this, 'compDataFunction'], ['is_safe' => ['html']]),
            new TwigFunction('compData', [$this, 'compDataFunction'], ['is_safe' => ['html']]),
        ];
    }

    private function dataAttrName(string $datasetName): string
    {
        return 'data-' . strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $datasetName));
    }

    private function dataValue($value): string
    {
        return $this->serializer->serialize($value, 'json');
    }

    /**
     * for direct use in html elements
     * <div {{ compData('datasetPrefix', { data: data }) }}></div>
     */
    public function compDataFunction(string $dataprefix, array $options = null)
    {
        $val = $options ? $this->dataValue($options) : '{}';
        return $this->dataAttrName($dataprefix) . '="' . htmlspecialchars($val) . '"';
    }

    /**
     * for use with symfony formbuilder attributes
     * form_widget(form.widget, {}|compData('datasetPrefix', { data: data }))
     */
    public function compDataFilter(array $attributes, string $dataprefix, array $options = null)
    {
        $attributes['attr'][$this->dataAttrName($dataprefix)] = $options ? $this->dataValue($options) : '{}';
        return $attributes;
    }
}
