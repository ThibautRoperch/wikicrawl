
<?php

header('Content-Type: application/json');

$url = NULL;

if (isset($_GET["url"])) {
  $url = $_GET["url"];
} else {
  // Page Wikipédia aléatoire

  // $random_url = "https://fr.wikipedia.org/wiki/Langue";
  // $random_url = "https://fr.wikipedia.org/wiki/Le_Coon"; // Paragraphe vide sans classe au début
  // $random_url = "https://fr.wikipedia.org/wiki/An%C3%A9mie_aplasique"; // Pas de liens dans le premier paragraphe, uniquement dans des listes
  // $random_url = "https://fr.wikipedia.org/wiki/Robert_L._May"; // Lien vers une date de naissance à éviter
  // $random_url = "https://fr.wikipedia.org/wiki/Hell%C3%A9an"; // Lien vers l'alphabet phonétique internationnal à éviter
  /* TODO */
  // $random_url = "https://fr.wikipedia.org/wiki/Faraj_Laheeb"; // Lien vers la langue de la traduction originale à éviter
  // $random_url = "https://fr.wikipedia.org/wiki/Gorinja"; // Lien vers la langue de la traduction originale à éviter
  /* FIN TODO */
  $random_url = "https://fr.wikipedia.org/wiki/Sp%C3%A9cial:Page_au_hasard";

  $url = $random_url;
}

$page = file_get_contents($url);

// Récupération de la page sous le format DOM Document

$doc = new DOMDocument(); 
@$doc->loadHTML($page);

include("dom_handler.php");

// Infos sur la page

preg_match('/rel=\"canonical\" href=\"(https:\/\/fr\.wikipedia\.org\/wiki\/.+)\"/', $page, $url_node);
$url = $url_node[1]; // - erreurs ici

$title = $doc->getElementById("firstHeading")->nodeValue; // - erreurs ici

// Recherche des noeuds contenant du texte dans le noeud principal
// Recherche des liens dans ces noeuds

$main_content = $doc->getElementById("mw-content-text")->childNodes[0]; // - erreurs ici

$contents = dom_search_multiple_nodes($main_content, ["p", "ul", "ol"]);

$links = [];

$i = 0;
while (/*count($links) === 0 && */$i < count($contents)) { // Si count($links) === 0 décommenté, la recherche will stop au premier content qui a au moins un lien  
  $content = $contents[$i];
  $content_links = dom_search_nodes($content, "a", false); // false pour éviter les liens qui sont dans un span dédié à la prononciation ou une balise time dédiée aux dates (naissance, etc)

  foreach ($content_links as $link) {
    // var_dump($link->nextSibling->nextSibling); // TODO regarder dans les noeuds suivants (après les autres liens potentiels) s'il y a un span avec la classe 'lang-xxx', si c'est le cas, ne pas garder le lien
    $href = dom_search_attribute($link, "href");
    if (preg_match('/^\/wiki/', $href)) {
      array_push($links, $href);
    }
  }

  ++$i;
}

// Enlever les liens peut pertinents en début d'article 

// $garbage_links = ["wiki/Grec_ancien", "wiki/Acronyme"];
// if (in_array($links[0], $garbage_links] {
//   array_shift($links);
// }

// Formattage des liens

$formatted_links = array_map(
  function ($link) {
    return "https://fr.wikipedia.org$link";
  },
  $links
);

// Retour du résultat

// echo "$title - <a href=\"$url\">$url</a>";
// var_dump($links);

$res = [
  "success" => true,
  "title" => $title,
  "url" => $url,
  "links" => $formatted_links
];

echo(json_encode($res));

?>
