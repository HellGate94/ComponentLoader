<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class ComponentLoaderExtension extends AbstractExtension {
    /**
     * {@inheritdoc}
     */
    public function getFilters(): array {
        return [
            new TwigFilter('compdata', [$this, 'compdatafilter']),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions(): array {
        return [
            new TwigFunction('compdata', [$this, 'compdatafunction'], ['is_safe' => ['html']]),
        ];
    }

    private function dataattrname(string $datasetname) {
        return 'data-' . strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $datasetname));
    }

    private function datavalue($value) {
        return json_encode($value);
    }

    /**
     * for direct use in html elements
     * <div {{ compdata('datasetPrefix', { data: data }) }}></div>
     */
    public function compdatafunction(string $dataprefix, array $options) {
        $ret = '';
        $first = true;
        foreach ($options as $key => $value) {
            if (!$first) {
                $ret .= ' ';
            }
            $dataattrname = $this->dataattrname($dataprefix . \ucfirst($key));
            $ret .= $dataattrname . '="' . htmlspecialchars($this->datavalue($value)) . '"';
            $first = false;
        }
        return $ret;
    }

    /**
     * for use with symfony formbuilder attributes
     * form_widget(form.widget, {}|compdata('datasetPrefix', { data: data }))
     */
    public function compdatafilter(array $attributes, string $dataprefix, array $options) {
        foreach ($options as $key => $value) {
            $attributes['attr'][$this->dataattrname($dataprefix . \ucfirst($key))] = $this->datavalue($value);
        }
        return $attributes;
    }
}
