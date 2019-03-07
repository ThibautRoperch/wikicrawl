<?php

function dom_search_nodes($dom_element, $tag, $go_deep) {
  $children = [];

  if ($go_deep) {

    $children = $dom_element->getElementsByTagName($tag);

  } else {

    foreach ($dom_element->childNodes as $child) {
      if (isset($child->tagName) && $child->tagName === $tag) {
        array_push($children, $child);
      }
    }

  }

  return $children;
}

function dom_search_multiple_nodes($dom_element, $tags) {
  $children = [];

  foreach ($dom_element->childNodes as $child) {
    if (isset($child->tagName) && in_array($child->tagName, $tags)) {
      array_push($children, $child);
    }
  }

  return $children;
}

function dom_search_attribute($dom_element, $name) {
  $value = null;

  $i = 0;
  while ($i < count($dom_element->attributes) && !$value) {
    if ($dom_element->attributes[$i]->name === $name) {
      $value = $dom_element->attributes[$i]->value;
    }
    ++$i;
  }

  return $value;
}

?>
