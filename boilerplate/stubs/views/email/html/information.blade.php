<x-mail::html.information>
    <x-slot:body>
        <% if (!content) { %>        <!-- Required content -->
        <% } else { %>        <%- content %><% } %>
    </x-slot:body>

    <x-slot:preview><!-- Optional content --></x-slot:preview>
</x-mail::html.information>
